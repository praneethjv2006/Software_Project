import { useState } from 'react';

export default function usePage(initialPage, initialProps = {}) {
  const [page, setPage] = useState({ name: initialPage, props: initialProps });
  const goto = (name, props = {}) => setPage({ name, props });
  return [page, goto];
}
