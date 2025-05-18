
import { toast as sonnerToast } from "sonner";

// Create a wrapper function that can handle both the new Sonner style 
// and the old toast interface for backward compatibility
function toast(props: string | { title?: string; description?: string; duration?: number }) {
  if (typeof props === 'string') {
    // Simple string message
    return sonnerToast(props);
  } else {
    // Object style with title/description/duration
    const { title, description, duration } = props;
    return sonnerToast(title || '', {
      description,
      duration,
    });
  }
}

export { toast };
