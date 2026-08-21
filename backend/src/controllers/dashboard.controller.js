const prisma = require('../config/prisma');

// Helper to compute inventory metrics for products
async function getInventoryMetrics() {
  const productsWithInv = await prisma.product.findMany({
    include: { inventory: true, category: true }
  });

  let totalOnHand = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  const inventoryChart = productsWithInv.slice(0, 10).map(p => {
    const onHand = p.inventory.reduce((acc, tx) => {
      if (['RECEIPT', 'PRODUCTION_OUTPUT', 'ADJUSTMENT_IN'].includes(tx.transactionType)) return acc + tx.quantity;
      if (['ISSUE', 'PRODUCTION_CONSUMPTION', 'ADJUSTMENT_OUT'].includes(tx.transactionType)) return acc - tx.quantity;
      return acc;
    }, 0);

    totalOnHand += Math.max(0, onHand);
    if (onHand <= 0) outOfStockCount++;
    else if (onHand <= p.reorderLevel) lowStockCount++;

    return {
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      onHand: Math.max(0, onHand),
      reorderLevel: p.reorderLevel
    };
  });

  // Group stock by Category
  const catStockMap = {};
  productsWithInv.forEach(p => {
    const cName = p.category?.name || 'General';
    const onHand = p.inventory.reduce((acc, tx) => {
      if (['RECEIPT', 'PRODUCTION_OUTPUT', 'ADJUSTMENT_IN'].includes(tx.transactionType)) return acc + tx.quantity;
      if (['ISSUE', 'PRODUCTION_CONSUMPTION', 'ADJUSTMENT_OUT'].includes(tx.transactionType)) return acc - tx.quantity;
      return acc;
    }, 0);
    catStockMap[cName] = (catStockMap[cName] || 0) + Math.max(0, onHand);
  });
  const categoryStockChart = Object.entries(catStockMap).map(([name, value]) => ({ name, value }));

  const totalStockValue = productsWithInv.reduce((sum, p) => {
    const onHand = p.inventory.reduce((acc, tx) => {
      if (['RECEIPT', 'PRODUCTION_OUTPUT', 'ADJUSTMENT_IN'].includes(tx.transactionType)) return acc + tx.quantity;
      if (['ISSUE', 'PRODUCTION_CONSUMPTION', 'ADJUSTMENT_OUT'].includes(tx.transactionType)) return acc - tx.quantity;
      return acc;
    }, 0);
    return sum + (Math.max(0, onHand) * Number(p.costPrice));
  }, 0);

  return { totalOnHand, lowStockCount, outOfStockCount, inventoryChart, categoryStockChart, totalStockValue, productsWithInv };
}

// 1. ADMINISTRATOR DASHBOARD
const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsersCount,
      activeUsersCount,
      suspendedUsersCount,
      totalProductsCount,
      totalCustomersCount,
      totalSuppliersCount,
      allSalesOrders,
      allPurchaseOrders,
      allProductionOrders,
      allInvoices
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: { in: ['INACTIVE', 'SUSPENDED'] } } }),
      prisma.product.count(),
      prisma.customer.count(),
      prisma.supplier.count(),
      prisma.salesOrder.findMany({ include: { customer: true } }),
      prisma.purchaseOrder.findMany({ include: { supplier: true } }),
      prisma.productionOrder.findMany(),
      prisma.invoice.findMany()
    ]);

    const { totalOnHand, lowStockCount, inventoryChart } = await getInventoryMetrics();

    const totalRevenue = allInvoices.reduce((acc, inv) => acc + (Number(inv.total) - Number(inv.balanceDue)), 0);

    const kpis = {
      totalUsers: totalUsersCount,
      activeUsers: activeUsersCount,
      suspendedUsers: suspendedUsersCount,
      totalProducts: totalProductsCount,
      totalCustomers: totalCustomersCount,
      totalSuppliers: totalSuppliersCount,
      totalSalesOrders: allSalesOrders.length,
      totalPurchaseOrders: allPurchaseOrders.length,
      totalRevenue,
      pendingOrders: allSalesOrders.filter(o => o.status === 'DRAFT').length + allPurchaseOrders.filter(p => p.status === 'DRAFT').length,
      lowStockProducts: lowStockCount,
      pendingApprovals: allSalesOrders.filter(o => o.status === 'DRAFT').length
    };

    const salesChart = [
      { name: 'Sales Orders', count: allSalesOrders.length, value: allSalesOrders.reduce((a, b) => a + Number(b.total), 0) },
      { name: 'Purchase Orders', count: allPurchaseOrders.length, value: allPurchaseOrders.reduce((a, b) => a + Number(b.total), 0) }
    ];

    const manufacturingChart = [
      { name: 'Planned', value: allProductionOrders.filter(o => o.status === 'PLANNED').length },
      { name: 'In Progress', value: allProductionOrders.filter(o => o.status === 'IN_PROGRESS').length },
      { name: 'Completed', value: allProductionOrders.filter(o => o.status === 'COMPLETED').length }
    ];

    const purchaseChart = [
      { name: 'Draft', count: allPurchaseOrders.filter(p => p.status === 'DRAFT').length },
      { name: 'Confirmed', count: allPurchaseOrders.filter(p => p.status === 'CONFIRMED').length },
      { name: 'Received', count: allPurchaseOrders.filter(p => p.status === 'RECEIVED').length }
    ];

    const alerts = [];
    if (lowStockCount > 0) alerts.push(`Critical stock warning: ${lowStockCount} products are below safety reorder level.`);
    if (suspendedUsersCount > 0) alerts.push(`Security notice: ${suspendedUsersCount} user accounts are currently inactive/suspended.`);
    if (kpis.pendingApprovals > 0) alerts.push(`Action required: ${kpis.pendingApprovals} sales order requisitions pending approval.`);

    const recentActivity = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true } } }
    });

    return res.json({
      success: true,
      role: 'ADMINISTRATOR',
      dashboard: { kpis, charts: { salesChart, inventoryChart, manufacturingChart, purchaseChart }, alerts, recentActivity }
    });
  } catch (err) {
    console.error('getAdminDashboard error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// 2. SALES DASHBOARD
const getSalesDashboard = async (req, res) => {
  try {
    const [allSalesOrders, allQuotations, allEnquiries, totalCustomersCount, totalProductsCount] = await Promise.all([
      prisma.salesOrder.findMany({ include: { customer: true, items: { include: { product: true } } } }),
      prisma.quotation.findMany({ include: { customer: true } }),
      prisma.enquiry.findMany({ include: { customer: true } }),
      prisma.customer.count(),
      prisma.product.count()
    ]);

    const todayStr = new Date().toDateString();
    const salesToday = allSalesOrders
      .filter(o => new Date(o.createdAt).toDateString() === todayStr)
      .reduce((sum, o) => sum + Number(o.total), 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const salesThisMonth = allSalesOrders
      .filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + Number(o.total), 0);

    // Customer sales grouping
    const customerSalesMap = {};
    allSalesOrders.forEach(so => {
      const cName = so.customer?.companyName || 'Unknown Customer';
      customerSalesMap[cName] = (customerSalesMap[cName] || 0) + Number(so.total);
    });
    const topCustomers = Object.entries(customerSalesMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Product sales grouping
    const productSalesMap = {};
    allSalesOrders.forEach(so => {
      (so.items || []).forEach(item => {
        const pName = item.product?.name || 'Product';
        productSalesMap[pName] = (productSalesMap[pName] || 0) + (item.quantity || 0);
      });
    });
    const topSellingProducts = Object.entries(productSalesMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const pendingQuotationsCount = allQuotations.filter(q => q.status === 'DRAFT' || q.status === 'SENT').length;
    const confirmedOrdersCount = allSalesOrders.filter(o => o.status === 'CONFIRMED' || o.status === 'APPROVED').length;
    const pendingEnquiriesCount = allEnquiries.filter(e => e.status === 'NEW').length;
    const totalQuotationsCount = allQuotations.length;
    const conversionRate = totalQuotationsCount > 0 ? Math.round((confirmedOrdersCount / totalQuotationsCount) * 100) : (allSalesOrders.length > 0 ? 100 : 0);
    const outstandingSalesOrders = allSalesOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;

    const kpis = {
      todaySales: salesToday,
      monthlySales: salesThisMonth,
      pendingQuotations: pendingQuotationsCount,
      confirmedSalesOrders: confirmedOrdersCount,
      pendingCustomerEnquiries: pendingEnquiriesCount,
      conversionRate,
      topCustomers,
      topSellingProducts,
      outstandingSalesOrders
    };

    const salesChart = [
      { date: 'Draft Orders', count: allSalesOrders.filter(o => o.status === 'DRAFT').length, value: allSalesOrders.filter(o => o.status === 'DRAFT').reduce((a, b) => a + Number(b.total), 0) },
      { date: 'Confirmed Orders', count: confirmedOrdersCount, value: allSalesOrders.filter(o => o.status === 'CONFIRMED').reduce((a, b) => a + Number(b.total), 0) },
      { date: 'Delivered Orders', count: allSalesOrders.filter(o => o.status === 'DELIVERED').length, value: allSalesOrders.filter(o => o.status === 'DELIVERED').reduce((a, b) => a + Number(b.total), 0) }
    ];

    const conversionChart = [
      { name: 'New Enquiries', count: pendingEnquiriesCount },
      { name: 'Draft Quotations', count: allQuotations.filter(q => q.status === 'DRAFT').length },
      { name: 'Sent Quotations', count: allQuotations.filter(q => q.status === 'SENT').length },
      { name: 'Accepted Quotations', count: allQuotations.filter(q => q.status === 'ACCEPTED').length },
      { name: 'Converted Sales', count: confirmedOrdersCount }
    ];

    const alerts = [];
    if (pendingQuotationsCount > 0) alerts.push(`Pending Quotations: ${pendingQuotationsCount} draft quotations are awaiting customer response.`);
    if (pendingEnquiriesCount > 0) alerts.push(`New Enquiries: ${pendingEnquiriesCount} new customer enquiries require attention.`);
    if (outstandingSalesOrders > 0) alerts.push(`Fulfillment Notice: ${outstandingSalesOrders} confirmed sales orders are awaiting delivery.`);

    const recentActivity = await prisma.auditLog.findMany({
      where: { entity: { in: ['SalesOrder', 'Quotation', 'Enquiry', 'Customer'] } },
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true } } }
    });

    return res.json({
      success: true,
      role: 'SALES_EXECUTIVE',
      dashboard: { kpis, charts: { salesChart, conversionChart, topCustomers, topSellingProducts }, alerts, recentActivity }
    });
  } catch (err) {
    console.error('getSalesDashboard error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// 3. PURCHASE DASHBOARD
const getPurchaseDashboard = async (req, res) => {
  try {
    const [allPurchaseOrders, totalSuppliersCount, { lowStockCount, inventoryChart }] = await Promise.all([
      prisma.purchaseOrder.findMany({ include: { supplier: true, items: { include: { product: true } } } }),
      prisma.supplier.count(),
      getInventoryMetrics()
    ]);

    const totalProcurementValue = allPurchaseOrders.reduce((sum, p) => sum + Number(p.total), 0);
    const pendingPurchaseRequests = allPurchaseOrders.filter(p => p.status === 'DRAFT').length;
    const pendingPurchaseOrders = allPurchaseOrders.filter(p => p.status === 'CONFIRMED' || p.status === 'PENDING').length;
    const approvedPurchaseOrders = allPurchaseOrders.filter(p => p.status === 'APPROVED' || p.status === 'CONFIRMED').length;

    const recentPurchases = allPurchaseOrders.slice(0, 5).map(po => ({
      poNumber: po.poNumber,
      supplier: po.supplier?.companyName || 'Supplier',
      total: Number(po.total),
      status: po.status
    }));

    const supplierSpendMap = {};
    allPurchaseOrders.forEach(po => {
      const sName = po.supplier?.companyName || 'Supplier';
      supplierSpendMap[sName] = (supplierSpendMap[sName] || 0) + Number(po.total);
    });
    const supplierWiseSpend = Object.entries(supplierSpendMap).map(([name, value]) => ({ name, value })).slice(0, 5);

    const kpis = {
      pendingPurchaseRequests,
      pendingPurchaseOrders,
      approvedPurchaseOrders,
      totalProcurementValue,
      activeSuppliers: totalSuppliersCount,
      productsToReorder: lowStockCount,
      recentPurchases,
      supplierPerformance: 95
    };

    const purchaseChart = [
      { name: 'Draft PO', count: allPurchaseOrders.filter(p => p.status === 'DRAFT').length },
      { name: 'Confirmed PO', count: allPurchaseOrders.filter(p => p.status === 'CONFIRMED').length },
      { name: 'Received PO', count: allPurchaseOrders.filter(p => p.status === 'RECEIVED').length }
    ];

    const alerts = [];
    if (lowStockCount > 0) alerts.push(`Material Reorder Alert: ${lowStockCount} raw material/hardware items are below safety reorder stock levels.`);
    if (pendingPurchaseRequests > 0) alerts.push(`Pending Approvals: ${pendingPurchaseRequests} purchase requisitions waiting for order confirmation.`);

    const recentActivity = await prisma.auditLog.findMany({
      where: { entity: { in: ['PurchaseOrder', 'Supplier', 'Product'] } },
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true } } }
    });

    return res.json({
      success: true,
      role: 'PURCHASE_MANAGER',
      dashboard: { kpis, charts: { purchaseChart, inventoryChart, supplierWiseSpend }, alerts, recentActivity }
    });
  } catch (err) {
    console.error('getPurchaseDashboard error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// 4. PRODUCTION MANAGER DASHBOARD
const getProductionDashboard = async (req, res) => {
  try {
    const [allProductionOrders, allBoms] = await Promise.all([
      prisma.productionOrder.findMany({ include: { product: true, bom: true } }),
      prisma.bOM.findMany({ include: { product: true } })
    ]);

    const activeProduction = allProductionOrders.filter(o => ['CONFIRMED', 'IN_PROGRESS'].includes(o.status));
    const planned = allProductionOrders.filter(o => o.status === 'PLANNED').length;
    const inProgress = allProductionOrders.filter(o => o.status === 'IN_PROGRESS').length;
    const completed = allProductionOrders.filter(o => o.status === 'COMPLETED').length;
    const delayed = allProductionOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && new Date(o.createdAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

    const totalPlannedQty = allProductionOrders.reduce((sum, o) => sum + (o.plannedQuantity || 0), 0);
    const totalProducedQty = allProductionOrders.reduce((sum, o) => sum + (o.producedQuantity || 0), 0);
    const productionEfficiency = totalPlannedQty > 0 ? Math.round((totalProducedQty / totalPlannedQty) * 100) : (completed > 0 ? 100 : 0);

    const kpis = {
      activeProductionOrders: activeProduction.length,
      plannedProduction: planned,
      inProgress,
      completed,
      delayedProduction: delayed,
      productionEfficiency,
      workCenterStatus: 'Assembly & Woodworking active',
      pendingManufacturingOrders: planned,
      totalBomsCount: allBoms.length
    };

    const manufacturingChart = [
      { name: 'Planned Runs', value: planned },
      { name: 'In Progress', value: inProgress },
      { name: 'Completed Runs', value: completed }
    ];

    const productionQuantityChart = [
      { name: 'Total Planned Units', quantity: totalPlannedQty },
      { name: 'Total Completed Units', quantity: totalProducedQty }
    ];

    const alerts = [];
    if (delayed > 0) alerts.push(`⚠️ Delayed Manufacturing: ${delayed} production runs are exceeding target completion timelines.`);
    if (planned > 0) alerts.push(`📋 Production Backlog: ${planned} planned manufacturing orders awaiting assembly dispatch.`);

    const recentActivity = await prisma.auditLog.findMany({
      where: { entity: { in: ['ProductionOrder', 'BOM', 'Manufacturing'] } },
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true } } }
    });

    return res.json({
      success: true,
      role: 'PRODUCTION_MANAGER',
      dashboard: { kpis, charts: { manufacturingChart, productionQuantityChart }, alerts, recentActivity }
    });
  } catch (err) {
    console.error('getProductionDashboard error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// 5. INVENTORY / WAREHOUSE DASHBOARD
const getInventoryDashboard = async (req, res) => {
  try {
    const [totalProductsCount, { totalOnHand, lowStockCount, outOfStockCount, inventoryChart, categoryStockChart, totalStockValue, productsWithInv }, pendingPO, pendingSO] = await Promise.all([
      prisma.product.count(),
      getInventoryMetrics(),
      prisma.purchaseOrder.count({ where: { status: 'CONFIRMED' } }),
      prisma.salesOrder.count({ where: { status: 'CONFIRMED' } })
    ]);

    const kpis = {
      totalProducts: totalProductsCount,
      totalStockQuantity: totalOnHand,
      lowStockItems: lowStockCount,
      outOfStockItems: outOfStockCount,
      incomingStock: pendingPO,
      outgoingStock: pendingSO,
      stockValue: totalStockValue,
      warehouseUtilization: 78
    };

    const alerts = [];
    if (outOfStockCount > 0) alerts.push(`🚨 Out of Stock Alert: ${outOfStockCount} items have zero available warehouse inventory.`);
    if (lowStockCount > 0) alerts.push(`⚠️ Low Stock Alert: ${lowStockCount} items are below configured reorder points.`);

    const recentActivity = await prisma.auditLog.findMany({
      where: { entity: { in: ['Product', 'InventoryTransaction', 'Category'] } },
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true } } }
    });

    return res.json({
      success: true,
      role: 'INVENTORY_MANAGER',
      dashboard: { kpis, charts: { inventoryChart, categoryStockChart }, alerts, recentActivity }
    });
  } catch (err) {
    console.error('getInventoryDashboard error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// 6. QUALITY DASHBOARD
const getQualityDashboard = async (req, res) => {
  try {
    const allInspections = await prisma.qualityInspection.findMany({
      include: { product: true, productionOrder: true }
    });

    const todayStr = new Date().toDateString();
    const inspectionsToday = allInspections.filter(i => new Date(i.createdAt).toDateString() === todayStr).length;
    const passed = allInspections.filter(i => i.status === 'PASSED').length;
    const failed = allInspections.filter(i => i.status === 'FAILED').length;
    const pending = allInspections.filter(i => i.status === 'PENDING').length;
    const defectRate = allInspections.length > 0 ? Math.round((failed / allInspections.length) * 100) : 0;

    const kpis = {
      inspectionsToday,
      passedInspections: passed,
      failedInspections: failed,
      pendingInspections: pending,
      defectRate,
      qualityAlerts: failed,
      openQualityIssues: pending
    };

    const inspectionChart = [
      { name: 'Passed QC Audit', value: passed },
      { name: 'Failed QC Defect', value: failed },
      { name: 'Pending Inspection', value: pending }
    ];

    const auditBreakdownChart = [
      { name: 'Passed Items', count: passed },
      { name: 'Failed Defective Items', count: failed }
    ];

    const alerts = [];
    if (failed > 0) alerts.push(`🚨 Quality Alert: ${failed} batch inspections failed defect checks.`);
    if (pending > 0) alerts.push(`📋 Inspection Backlog: ${pending} production units are pending quality audit approval.`);

    const recentActivity = await prisma.auditLog.findMany({
      where: { entity: { in: ['QualityInspection', 'Quality'] } },
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true } } }
    });

    return res.json({
      success: true,
      role: 'QUALITY_MANAGER',
      dashboard: { kpis, charts: { inspectionChart, auditBreakdownChart }, alerts, recentActivity }
    });
  } catch (err) {
    console.error('getQualityDashboard error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// 7. DELIVERY DASHBOARD
const getDeliveryDashboard = async (req, res) => {
  try {
    const allDeliveries = await prisma.deliveryOrder.findMany({
      include: { customer: true, salesOrder: true }
    });

    const pendingDeliveriesCount = allDeliveries.filter(d => d.status !== 'DELIVERED').length;
    const todayStr = new Date().toDateString();
    const todayDeliveries = allDeliveries.filter(d => new Date(d.scheduledDate || d.createdAt).toDateString() === todayStr).length;
    const inTransit = allDeliveries.filter(d => d.status === 'SHIPPED' || d.status === 'IN_TRANSIT').length;
    const delivered = allDeliveries.filter(d => d.status === 'DELIVERED').length;
    const delayed = allDeliveries.filter(d => d.status !== 'DELIVERED' && new Date(d.scheduledDate || d.createdAt) < new Date()).length;
    const failedDeliveries = allDeliveries.filter(d => d.status === 'FAILED').length;
    const totalFinished = delivered + failedDeliveries;
    const onTimeDeliveryRate = totalFinished > 0 ? Math.round((delivered / totalFinished) * 100) : 100;

    const kpis = {
      pendingDeliveries: pendingDeliveriesCount,
      todayDeliveries,
      inTransit,
      delivered,
      delayed,
      failedDeliveries,
      onTimeDeliveryRate
    };

    const deliveryChart = [
      { name: 'Scheduled Dispatches', count: allDeliveries.filter(d => d.status === 'SCHEDULED' || d.status === 'PLANNED').length },
      { name: 'In Transit', count: inTransit },
      { name: 'Delivered', count: delivered }
    ];

    const deliveryStatusPie = [
      { name: 'Delivered', value: delivered },
      { name: 'In Transit', value: inTransit },
      { name: 'Scheduled', value: allDeliveries.filter(d => d.status === 'SCHEDULED' || d.status === 'PLANNED').length }
    ];

    const alerts = [];
    if (delayed > 0) alerts.push(`⚠️ Dispatch Delay: ${delayed} delivery shipments are past scheduled delivery dates.`);
    if (pendingDeliveriesCount > 0) alerts.push(`🚛 Dispatch Queue: ${pendingDeliveriesCount} sales orders ready for carrier dispatch.`);

    const recentActivity = await prisma.auditLog.findMany({
      where: { entity: { in: ['DeliveryOrder', 'Delivery'] } },
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true } } }
    });

    return res.json({
      success: true,
      role: 'DELIVERY_MANAGER',
      dashboard: { kpis, charts: { deliveryChart, deliveryStatusPie }, alerts, recentActivity }
    });
  } catch (err) {
    console.error('getDeliveryDashboard error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// 8. FINANCE DASHBOARD
const getFinanceDashboard = async (req, res) => {
  try {
    const [allInvoices, allPurchaseOrders, allPayments] = await Promise.all([
      prisma.invoice.findMany({ include: { customer: true, payments: true } }),
      prisma.purchaseOrder.findMany(),
      prisma.payment.findMany()
    ]);

    const totalRevenue = allInvoices.reduce((sum, inv) => sum + (Number(inv.total) - Number(inv.balanceDue)), 0);
    const accountsReceivable = allInvoices.reduce((sum, inv) => sum + Number(inv.balanceDue), 0);
    const totalExpenses = allPurchaseOrders.reduce((sum, po) => sum + Number(po.total), 0);
    const accountsPayable = totalExpenses;

    const outstandingInvoices = allInvoices.filter(i => i.status !== 'PAID').length;
    const paidInvoices = allInvoices.filter(i => i.status === 'PAID').length;
    const overdueInvoices = allInvoices.filter(i => i.status === 'SENT' && Number(i.balanceDue) > 0).length;
    const netCashFlow = totalRevenue - totalExpenses;

    const kpis = {
      totalRevenue,
      totalExpenses,
      accountsReceivable,
      accountsPayable,
      outstandingInvoices,
      paidInvoices,
      overdueInvoices,
      netCashFlow
    };

    const invoiceStatusChart = [
      { name: 'Unpaid Invoices', count: allInvoices.filter(i => i.status === 'UNPAID').length },
      { name: 'Partially Paid Invoices', count: allInvoices.filter(i => i.status === 'PARTIALLY_PAID').length },
      { name: 'Paid In Full', count: paidInvoices }
    ];

    const financialComparisonChart = [
      { name: 'Collected Revenue', amount: totalRevenue },
      { name: 'Procurement Expenses', amount: totalExpenses },
      { name: 'Accounts Receivable', amount: accountsReceivable }
    ];

    const alerts = [];
    if (overdueInvoices > 0) alerts.push(`⚠️ Payment Overdue: ${overdueInvoices} customer invoices are pending payment collection.`);
    if (accountsReceivable > 0) alerts.push(`💰 Receivables: Total outstanding balance due from clients is ₹${accountsReceivable.toLocaleString()}.`);

    const recentActivity = await prisma.auditLog.findMany({
      where: { entity: { in: ['Invoice', 'Payment', 'Finance'] } },
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true } } }
    });

    return res.json({
      success: true,
      role: 'ACCOUNTS_FINANCE',
      dashboard: { kpis, charts: { invoiceStatusChart, financialComparisonChart }, alerts, recentActivity }
    });
  } catch (err) {
    console.error('getFinanceDashboard error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// UNIFIED ROLE AUTO-DETECTOR ENDPOINT
const getRoleDashboard = async (req, res) => {
  const rawRole = req.user?.role || 'ADMINISTRATOR';
  const role = String(rawRole).toUpperCase().trim();

  if (role === 'SALES_EXECUTIVE' || role === 'SALES') return getSalesDashboard(req, res);
  if (role === 'PURCHASE_MANAGER' || role === 'PURCHASE') return getPurchaseDashboard(req, res);
  if (role === 'PRODUCTION_MANAGER' || role === 'MANUFACTURING') return getProductionDashboard(req, res);
  if (role === 'INVENTORY_MANAGER' || role === 'INVENTORY') return getInventoryDashboard(req, res);
  if (role === 'QUALITY_MANAGER' || role === 'QUALITY') return getQualityDashboard(req, res);
  if (role === 'DELIVERY_MANAGER' || role === 'DELIVERY') return getDeliveryDashboard(req, res);
  if (role === 'ACCOUNTS_FINANCE' || role === 'FINANCE') return getFinanceDashboard(req, res);

  // Default for ADMINISTRATOR & BUSINESS_OWNER
  return getAdminDashboard(req, res);
};

module.exports = {
  getAdminDashboard,
  getSalesDashboard,
  getPurchaseDashboard,
  getProductionDashboard,
  getInventoryDashboard,
  getQualityDashboard,
  getDeliveryDashboard,
  getFinanceDashboard,
  getRoleDashboard
};
