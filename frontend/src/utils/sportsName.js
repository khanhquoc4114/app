// src/utils/sportName.js
export const getSportName = (sportType) => {
    const names = {
        badminton: 'Cầu lông',
        football: 'Bóng đá',
        tennis: 'Tennis',
        basketball: 'Bóng rổ'
    };
    return names[sportType] || sportType;
};