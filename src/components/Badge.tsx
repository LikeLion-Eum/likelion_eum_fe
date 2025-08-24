export default function Badge({ children, variant="gray" }:{
  children:React.ReactNode; variant?:"gray"|"red"|"green";
}) {
  const cls = variant==="red" ? "bg-red-100 text-red-700"
           : variant==="green" ? "bg-green-100 text-green-700"
           : "bg-gray-100 text-gray-700";
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${cls}`}>{children}</span>;
}
