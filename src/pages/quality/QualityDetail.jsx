import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { getInspectionById } from '../../services/qualityService';

const QualityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    const data = getInspectionById(id);
    if (data) {
      setInspection(data);
    }
  }, [id]);

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

  const getResultType = (result) => {
    if (result === 'Passed') return 'success';
    if (result === 'Failed') return 'danger';
    if (result === 'Needs Rework') return 'warning';
    return 'default';
  };

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
          <h1 className="text-2xl font-bold">Inspection: {inspection.id}</h1>
          <StatusBadge status={inspection.result} type={getResultType(inspection.result)} />
        </div>
        <button
          onClick={() => navigate(`/quality/${id}/edit`)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Edit size={18} /> Edit
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Product</h3>
            <p className="mt-1 text-lg">{inspection.product}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Production Order</h3>
            <p className="mt-1 text-lg">{inspection.productionOrder}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Inspector</h3>
            <p className="mt-1 text-lg">{inspection.inspector}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date</h3>
            <p className="mt-1 text-lg">{inspection.date}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1 text-lg">{inspection.status}</p>
          </div>
          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Defects</h3>
            <p className="mt-1 bg-gray-50 p-3 rounded border border-gray-100 min-h-[3rem]">
              {inspection.defects || 'No defects recorded.'}
            </p>
          </div>
          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <p className="mt-1 bg-gray-50 p-3 rounded border border-gray-100 min-h-[3rem]">
              {inspection.notes || 'No additional notes.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityDetail;
