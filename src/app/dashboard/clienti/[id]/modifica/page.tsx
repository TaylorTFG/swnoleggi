import ClientForm from "./ClientForm";

export default function ModificaClientePage({ params }: { params: { id: string } }) {
  return <ClientForm id={params.id} />;
} 