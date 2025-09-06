import React from 'react';
import { toStatusLabelVI } from '../../constants/taskStatus';

const cls = (label) => {
  switch (label) {
    case 'Hoàn thành': return 'bg-green-100 text-green-800';
    case 'Đang thực hiện': return 'bg-blue-100 text-blue-800';
    case 'Quá hạn': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const StatusBadge = ({ status }) => {
  const label = toStatusLabelVI(status);
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${cls(label)}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
