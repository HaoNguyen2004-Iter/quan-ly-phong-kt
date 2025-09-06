// Mã loại nghỉ
export const LEAVE_TYPE = {
  ANNUAL: 'annual',      // Nghỉ phép năm
  SICK: 'sick',          // Nghỉ bệnh
  UNPAID: 'unpaid',      // Nghỉ không lương
  COMP: 'comp',          // Nghỉ bù
};

// Nhãn loại nghỉ (VI)
export const LEAVE_TYPE_LABEL_VI = {
  [LEAVE_TYPE.ANNUAL]: 'Nghỉ phép năm',
  [LEAVE_TYPE.SICK]: 'Nghỉ bệnh',
  [LEAVE_TYPE.UNPAID]: 'Nghỉ không lương',
  [LEAVE_TYPE.COMP]: 'Nghỉ bù',
};

export const typeOptionsVI = [
  { value: LEAVE_TYPE.ANNUAL, label: LEAVE_TYPE_LABEL_VI[LEAVE_TYPE.ANNUAL] },
  { value: LEAVE_TYPE.SICK, label: LEAVE_TYPE_LABEL_VI[LEAVE_TYPE.SICK] },
  { value: LEAVE_TYPE.UNPAID, label: LEAVE_TYPE_LABEL_VI[LEAVE_TYPE.UNPAID] },
  { value: LEAVE_TYPE.COMP, label: LEAVE_TYPE_LABEL_VI[LEAVE_TYPE.COMP] },
];

// Mã trạng thái
export const LEAVE_STATUS = {
  PENDING: 'pending',    // chờ duyệt
  APPROVED: 'approved',  // đã duyệt
  REJECTED: 'rejected',  // từ chối
  CANCELLED: 'cancelled' // hủy
};

// Nhãn trạng thái (VI)
export const LEAVE_STATUS_LABEL_VI = {
  [LEAVE_STATUS.PENDING]: 'Chờ duyệt',
  [LEAVE_STATUS.APPROVED]: 'Đã duyệt',
  [LEAVE_STATUS.REJECTED]: 'Từ chối',
  [LEAVE_STATUS.CANCELLED]: 'Hủy',
};

export const statusOptionsVI = [
  { value: LEAVE_STATUS.PENDING, label: LEAVE_STATUS_LABEL_VI[LEAVE_STATUS.PENDING] },
  { value: LEAVE_STATUS.APPROVED, label: LEAVE_STATUS_LABEL_VI[LEAVE_STATUS.APPROVED] },
  { value: LEAVE_STATUS.REJECTED, label: LEAVE_STATUS_LABEL_VI[LEAVE_STATUS.REJECTED] },
  { value: LEAVE_STATUS.CANCELLED, label: LEAVE_STATUS_LABEL_VI[LEAVE_STATUS.CANCELLED] },
];

// Ca ngày
export const DAY_PART = {
  FULL: 'full',      // Cả ngày
  AM: 'am',          // Buổi sáng
  PM: 'pm',          // Buổi chiều
};

export const DAY_PART_LABEL_VI = {
  [DAY_PART.FULL]: 'Cả ngày',
  [DAY_PART.AM]: 'Buổi sáng',
  [DAY_PART.PM]: 'Buổi chiều',
};

export const dayPartOptionsVI = [
  { value: DAY_PART.FULL, label: DAY_PART_LABEL_VI[DAY_PART.FULL] },
  { value: DAY_PART.AM, label: DAY_PART_LABEL_VI[DAY_PART.AM] },
  { value: DAY_PART.PM, label: DAY_PART_LABEL_VI[DAY_PART.PM] },
];

export const toYMD = (v) => {
  if (!v) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
};

export const fmtDate = (ymd) => {
  if (!ymd) return '—';
  const [y, m, d] = String(ymd).split('-');
  if (!y || !m || !d) return ymd;
  return `${Number(d)}/${Number(m)}/${y}`;
};
