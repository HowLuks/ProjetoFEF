// Funções utilitárias para formatação de data

export function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

export function formatDateToYYYYMMDD(dateString) {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
}

export function getCurrentDateYYYYMMDD() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getCurrentDateDDMMYYYY() {
    return formatDateToDDMMYYYY(getCurrentDateYYYYMMDD());
}

