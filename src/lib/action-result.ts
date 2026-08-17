import { toast } from "sonner";

export function showActionError(result: unknown) {
  if (
    result &&
    typeof result === "object" &&
    "error" in result &&
    typeof result.error === "string"
  ) {
    toast.error(result.error);
    return true;
  }
  return false;
}

export function actionId(result: unknown) {
  if (result && typeof result === "object" && "id" in result && typeof result.id === "string") {
    return result.id;
  }
  return null;
}
