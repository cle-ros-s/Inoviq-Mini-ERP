export function calcFreeToUse(onHand, reserved) {
  return Math.max(0, onHand - (reserved || 0));
}

export function calcStockStatus(onHand, reorderLevel) {
  if (onHand <= 0) return 'Out of Stock';
  if (onHand <= reorderLevel) return 'Low Stock';
  return 'Healthy';
}

export function calcBomExplosion(bomComponents, moQuantity) {
  return bomComponents.map(comp => ({
    productId: comp.productId,
    requiredQty: (comp.qty || 0) * (moQuantity || 0)
  }));
}

export function calcLineTotal(qty, unitPrice, discountPct, taxPct) {
  const gross = qty * unitPrice;
  const discount = gross * ((discountPct || 0) / 100);
  const net = gross - discount;
  const tax = net * ((taxPct || 0) / 100);
  return net + tax;
}

export function calcOrderTotals(lines) {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;
  let grandTotal = 0;

  lines.forEach(line => {
    const gross = (line.qty || 0) * (line.unitPrice || line.costPrice || 0);
    const discount = gross * ((line.discount || 0) / 100);
    const net = gross - discount;
    const tax = net * ((line.tax || 0) / 100);

    subtotal += gross;
    discountTotal += discount;
    taxTotal += tax;
    grandTotal += (net + tax);
  });

  return { subtotal, discountTotal, taxTotal, grandTotal };
}

export function calcMaterialAvailability(components, inventory) {
  return components.map(comp => {
    const inv = inventory.find(i => i.productId === comp.productId) || { onHand: 0, reserved: 0 };
    const available = Math.max(0, inv.onHand - inv.reserved);
    const required = comp.requiredQty || comp.qty || 0; // handle pre-exploded or raw bom component
    const shortage = calcShortage(required, available);
    return {
      ...comp,
      required,
      available,
      shortage,
      canFulfill: shortage === 0
    };
  });
}

export function calcShortage(required, available) {
  return Math.max(0, required - available);
}
