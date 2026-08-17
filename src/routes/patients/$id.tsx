import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/patients/$id")({
  component: PatientDetailRedirect,
});

function PatientDetailRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/dashboard", replace: true });
  }, [navigate]);
  return null;
}
