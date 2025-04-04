import { use } from "react";
import RentalForm from "./RentalForm";

interface PageProps {
  params: {
    id: string;
  };
}

export default function ModificaNoleggioPage({ params }: PageProps) {
  const id = use(Promise.resolve(params.id));
  return <RentalForm id={id} />;
} 