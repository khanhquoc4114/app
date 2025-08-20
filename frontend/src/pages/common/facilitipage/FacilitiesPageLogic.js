// Logic container for FacilitiesPage
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';
import { message } from 'antd';
import FacilitiesPageUI from './FacilitiesPageUI';

const FacilitiesPageLogic = () => {
    const location = useLocation();
    const [filters, setFilters] = useState({
        searchText: '',
        sport: 'all',
        priceRange: [0, 500000],
        location: 'all',
        rating: 0,
        amenities: [],
        availability: 'all',
        sortBy: 'name'
    });
    const [bookingModalVisible, setBookingModalVisible] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState({});
    const [facilities, setFacilities] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [favoritesLoaded, setFavoritesLoaded] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL;
    const facilitiesWithDistance = facilities;

    // Handle URL query parameters
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const sportParam = searchParams.get('sport');
        if (sportParam) {
            setFilters(prev => ({ ...prev, sport: sportParam }));
        }
    }, [location.search]);

    // Load favorites from localStorage
    useEffect(() => {
        const savedFavorites = localStorage.getItem('facilityFavorites');
        if (savedFavorites) {
            try {
                const parsedFavorites = JSON.parse(savedFavorites);
                setFavorites(parsedFavorites);
            } catch (error) {
                localStorage.removeItem('facilityFavorites');
            }
        }
        setFavoritesLoaded(true);
    }, []);

    // Save favorites to localStorage
    useEffect(() => {
        if (favoritesLoaded) {
            localStorage.setItem('facilityFavorites', JSON.stringify(favorites));
        }
    }, [favorites, favoritesLoaded]);

    // Open Google Maps
    const openGoogleMaps = (facility) => {
        const destination = encodeURIComponent(facility.location);
        let url;
        if (userLocation) {
            url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${destination}`;
        } else {
            url = `https://www.google.com/maps/search/${destination}`;
        }
        window.open(url, '_blank');
    };

    // Generate time slots
    const generateTimeSlots = (openingHours) => {
        const [startTime, endTime] = openingHours.split(' - ');
        const startHour = parseInt(startTime.split(':')[0]);
        const endHour = parseInt(endTime.split(':')[0]);
        const slots = [];
        for (let hour = startHour; hour <= endHour; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        return slots;
    };

    // Fetch facilities
    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const res = await fetch(`${API_URL}/api/facilities`);
                const data = await res.json();
                const facilitiesWithSlots = data.map(facility => ({
                    ...facility,
                    available_slots: generateTimeSlots(facility.opening_hours)
                }));
                setFacilities(facilitiesWithSlots);
            } catch (err) {
                console.error("Error fetching facilities:", err);
            }
        };
        fetchFacilities();
    }, [API_URL]);

    // Filter facilities
    const filteredFacilities = facilitiesWithDistance.filter(facility => {
        const searchText = filters.searchText.toLowerCase();
        const matchesSearch = filters.searchText === '' ||
            facility.name.toLowerCase().includes(searchText) ||
            facility.description.toLowerCase().includes(searchText) ||
            facility.location.toLowerCase().includes(searchText) ||
            (facility.address && facility.address.toLowerCase().includes(searchText)) ||
            (facility.district && facility.district.toLowerCase().includes(searchText)) ||
            (facility.ward && facility.ward.toLowerCase().includes(searchText)) ||
            (facility.city && facility.city.toLowerCase().includes(searchText));

        const matchesSport = filters.sport === 'all' || facility.sport_type === filters.sport;
        const matchesLocation = filters.location === 'all' || 
            (facility.district && facility.district.toLowerCase().includes(filters.location.toLowerCase())) ||
            facility.location.toLowerCase().includes(filters.location.toLowerCase());
        const matchesPrice = facility.price_per_hour >= filters.priceRange[0] &&
            facility.price_per_hour <= filters.priceRange[1];
        const matchesRating = filters.rating === 0 || facility.rating >= filters.rating;

        const matchesAmenities = filters.amenities.length === 0 ||
            filters.amenities.every(amenity => {
                const amenityMap = {
                    'parking': 'Bãi đỗ xe',
                    'ac': 'Điều hòa',
                    'wifi': 'Wifi',
                    'shower': 'Phòng thay đồ',
                    'canteen': 'Căng tin',
                    'equipment': 'Thuê vợt'
                };
                return facility.amenities?.includes(amenityMap[amenity]);
            });

        return matchesSearch && matchesSport && matchesLocation && matchesPrice && matchesRating && matchesAmenities;
    }).sort((a, b) => {
        const aIsFavorite = favorites.includes(a.id);
        const bIsFavorite = favorites.includes(b.id);

        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;

        switch (filters.sortBy) {
            case 'price_asc': return a.price_per_hour - b.price_per_hour;
            case 'price_desc': return b.price_per_hour - a.price_per_hour;
            case 'rating': return b.rating - a.rating;
            case 'name':
            default: return a.name.localeCompare(b.name);
        }
    });

    const favoriteFacilities = filteredFacilities.filter(f => favorites.includes(f.id));

    // Handlers
    const handleBookFacility = (facility) => {
        setSelectedFacility(facility);
        setBookingModalVisible(true);
        
        const facilityDateKey = `${facility.id}_${selectedDate.format('YYYY-MM-DD')}`;
        if (!bookedSlots[facilityDateKey]) {
            const newBookedSlots = {};
            facility.available_slots.forEach(slot => {
                newBookedSlots[slot] = Math.random() < 0.3;
            });
            setBookedSlots(prev => ({
                ...prev,
                [facilityDateKey]: newBookedSlots
            }));
        }
    };

    const handleTimeSlotChange = (timeSlot) => {
        setSelectedTimeSlots(prev => {
            if (prev.includes(timeSlot)) {
                return prev.filter(slot => slot !== timeSlot);
            } else {
                return [...prev, timeSlot];
            }
        });
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setSelectedTimeSlots([]);

        if (selectedFacility) {
            const facilityDateKey = `${selectedFacility.id}_${date.format('YYYY-MM-DD')}`;
            if (!bookedSlots[facilityDateKey]) {
                const newBookedSlots = {};
                selectedFacility.available_slots.forEach(slot => {
                    newBookedSlots[slot] = Math.random() < 0.3;
                });
                setBookedSlots(prev => ({
                    ...prev,
                    [facilityDateKey]: newBookedSlots
                }));
            }
        }
    };

    const handleToggleFavorite = (facilityId, e) => {
        e.stopPropagation();

        setFavorites(prev => {
            const isFavorited = prev.includes(facilityId);
            let newFavorites;

            if (isFavorited) {
                newFavorites = prev.filter(id => id !== facilityId);
                message.success('Đã bỏ khỏi danh sách yêu thích');
            } else {
                newFavorites = [...prev, facilityId];
                message.success('Đã thêm vào danh sách yêu thích');
            }

            return newFavorites;
        });
    };

    const handleBookingSubmit = () => {
        if (selectedTimeSlots.length === 0) {
            message.error('Vui lòng chọn ít nhất một khung giờ');
            return;
        }

        const totalAmount = selectedTimeSlots.length * selectedFacility.price_per_hour;
        message.success(`Đặt sân thành công! Tổng tiền: ${new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(totalAmount)}`);

        setBookingModalVisible(false);
        setSelectedTimeSlots([]);
    };
        const facilityDateKey = `${facility.id}_${selectedDate.format('YYYY-MM-DD')}`;
        if (!bookedSlots[facilityDateKey]) {
            const newBookedSlots = {};
            facility.available_slots.forEach(slot => {
                newBookedSlots[slot] = Math.random() < 0.3;
            });
            setBookedSlots(prev => ({ ...prev, [facilityDateKey]: newBookedSlots }));
        }
    };

    const handleTimeSlotChange = (timeSlot) => {
        setSelectedTimeSlots(prev => {
            if (prev.includes(timeSlot)) {
                return prev.filter(slot => slot !== timeSlot);
            } else {
                return [...prev, timeSlot];
            }
        });
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setSelectedTimeSlots([]);
        
        if (selectedFacility) {
            const facilityDateKey = `${selectedFacility.id}_${date.format('YYYY-MM-DD')}`;
            if (!bookedSlots[facilityDateKey]) {
                const newBookedSlots = {};
                selectedFacility.available_slots.forEach(slot => {
                    newBookedSlots[slot] = Math.random() < 0.3;
                });
                setBookedSlots(prev => ({ ...prev, [facilityDateKey]: newBookedSlots }));
            }
        }
    };

    const handleToggleFavorite = (facilityId, e) => {
        e.stopPropagation();
        setFavorites(prev => {
            const isFavorited = prev.includes(facilityId);
            let newFavorites;
            if (isFavorited) {
                newFavorites = prev.filter(id => id !== facilityId);
                message.success('Đã bỏ khỏi danh sách yêu thích');
            } else {
                newFavorites = [...prev, facilityId];
                message.success('Đã thêm vào danh sách yêu thích');
            }
            return newFavorites;
        });
    };

    const handleBookingSubmit = () => {
        if (selectedTimeSlots.length === 0) {
            message.error('Vui lòng chọn ít nhất một khung giờ');
            return;
        }
        const totalAmount = selectedTimeSlots.length * selectedFacility.price_per_hour;
        message.success(`Đặt sân thành công! Tổng tiền: ${FacilityHelper.formatPrice(totalAmount)}`);
        setBookingModalVisible(false);
        setSelectedTimeSlots([]);
    };

    const sportTypes = [
        { value: 'all', label: 'Tất cả' },
        { value: 'badminton', label: 'Cầu lông' },
        { value: 'football', label: 'Bóng đá' },
        { value: 'tennis', label: 'Tennis' },
        { value: 'basketball', label: 'Bóng rổ' }
    ];

    return (
        <FacilitiesPageUI 
            filters={filters}
            setFilters={setFilters}
            bookingModalVisible={bookingModalVisible}
            setBookingModalVisible={setBookingModalVisible}
            selectedFacility={selectedFacility}
            selectedDate={selectedDate}
            selectedTimeSlots={selectedTimeSlots}
            bookedSlots={bookedSlots}
            facilities={facilities}
            favorites={favorites}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            filteredFacilities={filteredFacilities}
            favoriteFacilities={favoriteFacilities}
            openGoogleMaps={openGoogleMaps}
            handleBookFacility={handleBookFacility}
            handleTimeSlotChange={handleTimeSlotChange}
            handleDateChange={handleDateChange}
            handleToggleFavorite={handleToggleFavorite}
            handleBookingSubmit={handleBookingSubmit}
            sportTypes={sportTypes}
            FacilityHelper={FacilityHelper}
        />
    );
};

export default FacilitiesPageLogic;
