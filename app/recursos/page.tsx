import React from 'react';

import { Treemap, Data } from '@/components/ui/treemap';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const data: Data = {
  name: 'legend',
  children: [
    { name: 'chrome.exe', size: 200, color: 'gray' },
    { name: 'Libre', size: 7 },
    { name: 'firefox.exe', size: 70, color: 'gray' },
    { name: 'Libre', size: 12 },
    { name: 'vim.exe', size: 2, color: 'gray' },
    { name: 'Libre', size: 7 },
    { name: 'beamng.exe', size: 200, color: 'gray' },
    { name: 'Libre', size: 2 },
  ],
}

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] mx-5">

      <h1 className="text-2xl font-bold m-2">R1</h1>
      <Treemap data={data} className='w-full h-28' />
      <h1 className="text-xl font-light m-2">Listado de todos los procesos que usan este recurso</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="first:w-[100px] last:text-right">Proceso</TableHead>
            <TableHead className="first:w-[100px] last:text-right">Inicio</TableHead>
            <TableHead className="first:w-[100px] last:text-right">Fin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="first:font-medium last:text-right">chrome.exe</TableCell>
            <TableCell className="first:font-medium last:text-right">0MB</TableCell>
            <TableCell className="first:font-medium last:text-right">200MB</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="first:font-medium last:text-right">firefox.exe</TableCell>
            <TableCell className="first:font-medium last:text-right">207MB</TableCell>
            <TableCell className="first:font-medium last:text-right">277MB</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="first:font-medium last:text-right">vim.exe</TableCell>
            <TableCell className="first:font-medium last:text-right">289MB</TableCell>
            <TableCell className="first:font-medium last:text-right">291MB</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="first:font-medium last:text-right">beamng.exe</TableCell>
            <TableCell className="first:font-medium last:text-right">298MB</TableCell>
            <TableCell className="first:font-medium last:text-right">498MB</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
