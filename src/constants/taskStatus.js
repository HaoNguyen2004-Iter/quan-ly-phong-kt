// Chuẩn hoá mã trạng thái dùng trong FE
export const TASK_STATUS = {
  NEW: 'moi',
  IN_PROGRESS: 'dang_lam',
  DONE: 'hoan_thanh',
  OVERDUE: 'qua_han',
};

// Nhãn tiếng Việt để hiển thị
export const STATUS_LABEL_VI = {
  [TASK_STATUS.NEW]: 'Mới',
  [TASK_STATUS.IN_PROGRESS]: 'Đang thực hiện',
  [TASK_STATUS.DONE]: 'Hoàn thành',
  [TASK_STATUS.OVERDUE]: 'Quá hạn',
};

// Options cho <select>
export const statusOptionsVI = [
  { value: TASK_STATUS.NEW, label: STATUS_LABEL_VI[TASK_STATUS.NEW] },
  { value: TASK_STATUS.IN_PROGRESS, label: STATUS_LABEL_VI[TASK_STATUS.IN_PROGRESS] },
  { value: TASK_STATUS.DONE, label: STATUS_LABEL_VI[TASK_STATUS.DONE] },
  { value: TASK_STATUS.OVERDUE, label: STATUS_LABEL_VI[TASK_STATUS.OVERDUE] },
];

// Nhận cả mã tiếng Việt lẫn mã BE, trả về label VI
export const toStatusLabelVI = (s) => {
  if (!s) return STATUS_LABEL_VI[TASK_STATUS.NEW];
  const key = String(s).toLowerCase();
  const map = {
    moi: TASK_STATUS.NEW,
    'mới': TASK_STATUS.NEW,
    dang_lam: TASK_STATUS.IN_PROGRESS,
    'đang thực hiện': TASK_STATUS.IN_PROGRESS,
    hoan_thanh: TASK_STATUS.DONE,
    'hoàn thành': TASK_STATUS.DONE,
    qua_han: TASK_STATUS.OVERDUE,
    'quá hạn': TASK_STATUS.OVERDUE,
  };
  const norm = map[key] || key;
  return STATUS_LABEL_VI[norm] || STATUS_LABEL_VI[TASK_STATUS.NEW];
};
