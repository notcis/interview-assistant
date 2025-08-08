import { Spinner } from "@heroui/react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner color="default" label="Loading..." />
    </div>
  );
}
