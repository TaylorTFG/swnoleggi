import EquipmentForm from "./EquipmentForm";

export default function ModificaAttrezzaturaPage({ params }: { params: { id: string } }) {
  return <EquipmentForm id={params.id} />;
} 