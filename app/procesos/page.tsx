import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] mx-5">
      <h1 className="text-2xl font-bold m-2">Procesos</h1>
      <Table>
        <TableCaption>Listado de todos los procesos.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="first:w-[100px] last:text-right">Nombre</TableHead>
            <TableHead className="first:w-[100px] last:text-right">R1</TableHead>
            <TableHead className="first:w-[100px] last:text-right">R2</TableHead>
            <TableHead className="first:w-[100px] last:text-right">R3</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="first:font-medium last:text-right">chrome.exe</TableCell>
            <TableCell className="first:font-medium last:text-right">200MB</TableCell>
            <TableCell className="first:font-medium last:text-right">5MB</TableCell>
            <TableCell className="first:font-medium last:text-right">100MB</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="first:font-medium last:text-right">firefox.exe</TableCell>
            <TableCell className="first:font-medium last:text-right">70MB</TableCell>
            <TableCell className="first:font-medium last:text-right">1MB</TableCell>
            <TableCell className="first:font-medium last:text-right">10MB</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="first:font-medium last:text-right">vim.exe</TableCell>
            <TableCell className="first:font-medium last:text-right">2MB</TableCell>
            <TableCell className="first:font-medium last:text-right">5MB</TableCell>
            <TableCell className="first:font-medium last:text-right">3MB</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="first:font-medium last:text-right">beamng.exe</TableCell>
            <TableCell className="first:font-medium last:text-right">200MB</TableCell>
            <TableCell className="first:font-medium last:text-right">50MB</TableCell>
            <TableCell className="first:font-medium last:text-right">700MB</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell className="first:font-medium last:text-right">472 MB / 500MB</TableCell>
            <TableCell className="first:font-medium last:text-right">61 MB / 700MB</TableCell>
            <TableCell className="first:font-medium last:text-right">813 MB / 2000MB</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

    </div>
  );
}
