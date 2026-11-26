import { useMemo, useState } from 'react';
import { sortRows } from '../utils/table';

// accessors must be a constant defined outside the component
export function useSortedRows(rows, defaultSort, accessors) {
  const [sort, setSort] = useState(defaultSort);

  const sortedRows = useMemo(
    () => sortRows(rows, sort.orderBy, sort.order, accessors),
    [rows, sort, accessors]
  );

  const handleSort = (columnId) => {
    setSort((prev) => ({
      orderBy: columnId,
      order: prev.orderBy === columnId && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  return { sort, sortedRows, handleSort };
}