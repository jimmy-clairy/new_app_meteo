/**
 * Convertit un timestamp en une chaîne de caractères représentant l'heure.
 * @param {number} timestamp - Le timestamp à convertir.
 * @param {Object} [options={}] - Options de formatage de l'heure (voir Intl.DateTimeFormat).
 * @returns {string} Une chaîne de caractères représentant l'heure au format spécifié.
 * @example
 * const timestampExample = 1641740400; // Remplacez ceci par votre timestamp
 * const defaultFormat = formateTimestamp(timestampExample); // Exemple par défaut
 * const customFormat = formateTimestamp(timestampExample, { hour: 'numeric', minute: 'numeric' }); // Exemple personnalisé
 * console.log('Heure par défaut:', defaultFormat);
 * console.log('Heure personnalisée:', customFormat);
 */
export function formatTimestamp(timestamp, options = {}) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('fr-FR', options);
}

// Exemple d'utilisation :
// const timestampExample = 1641740400; // Remplacez ceci par votre timestamp
// const defaultFormat = formateTimestamp(timestampExample);
// const customFormat = formateTimestamp(timestampExample, { hour: 'numeric', minute: 'numeric' });
// console.log('Heure par défaut:', defaultFormat);
// console.log('Heure personnalisée:', customFormat);