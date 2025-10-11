import { useNavigate } from "react-router-dom";

// Helper function to get and clear the intended destination
export const getIntendedDestination = (): string | null => {
  const destination = localStorage.getItem("intendedDestination");
  if (destination) {
    localStorage.removeItem("intendedDestination");
    return destination;
  }
  return null;
};

// Hook to handle post-login redirection
export const usePostLoginRedirect = () => {
  const navigate = useNavigate();

  const redirectToIntendedDestination = () => {
    const intendedDestination = getIntendedDestination();

    if (intendedDestination) {
      navigate(intendedDestination, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  return { redirectToIntendedDestination };
};
