import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { getInspectionById } from '../../services/qualityService';

const QualityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getInspectionById(id);
        setInspection(data);
      } catch (err) {
        console.error('Failed to load quality inspection', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading inspection...</div>;
  if (!inspection) {
    return (
      <div className="p-6">
        <p>Inspection not found.</p>
        <button
          onClick={() => navigate('/quality')}
          className="text-blue-600 mt-4 flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>
    );
  }

  const inspId = inspection.inspectionNumber || inspection.id;
  const prodName = inspection.product?.name || inspection.product || 'Item';
  const inspectorName = inspection.inspector?.name || inspection.inspector || 'Inspector';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/quality')}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Inspection: {inspId}</h1>
          <StatusBadge status={inspection.result || inspection.status || 'PASSED'} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Product</h3>
            <p className="mt-1 text-lg font-semibold">{prodName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Production Order</h3>
            <p className="mt-1 text-lg">{inspection.productionOrderId || inspection.productionOrder || '—'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Inspector</h3>
            <p className="mt-1 text-lg">{inspectorName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Result / Status</h3>
            <p className="mt-1 text-lg font-bold">{inspection.result || inspection.status || 'PASSED'}</p>
          </div>
          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Defects / Checklist</h3>
            <p className="mt-1 bg-gray-50 p-3 rounded border border-gray-100 min-h-[3rem]">
              {inspection.defects || inspection.notes || 'No defects recorded.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityDetail;
