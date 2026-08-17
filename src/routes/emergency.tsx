import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [{ title: "Health Overview — SmartHealth Portal" }],
  }),
  component: () => <Navigate to="/dashboard" replace />,
});
