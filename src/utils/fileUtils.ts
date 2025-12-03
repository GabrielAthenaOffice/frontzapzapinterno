/**
 * Utilities for handling file URLs with signed URLs for private Supabase storage
 */

/**
 * Generates a signed URL for accessing a profile photo from private storage
 * Uses the /api/files/view endpoint which redirects to a temporary signed URL
 * 
 * @param fotoPerfil - Either a file path (e.g., "avatars/abc-123.png") or a full URL (legacy)
 * @returns Full URL to access the photo, or undefined if no photo
 */
export const getProfilePhotoUrl = (fotoPerfil: string | undefined): string | undefined => {
    if (!fotoPerfil) return undefined;

    // If already a full URL (legacy public URLs), return as is
    if (fotoPerfil.startsWith('http')) {
        return fotoPerfil;
    }

    // Otherwise, generate URL via backend endpoint that creates signed URLs
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    return `${apiUrl}/api/files/view?path=${encodeURIComponent(fotoPerfil)}`;
};
