document.addEventListener("DOMContentLoaded", () => {
    
    const bookingForm = document.getElementById('bookingForm');
    
    if (!bookingForm) return; 

    const pricePerNight = parseFloat(bookingForm.getAttribute('data-price'));
    const bookedDatesString = bookingForm.getAttribute('data-booked-dates');
    const disableDates = JSON.parse(bookedDatesString);

    const displayTotal = document.getElementById('displayTotal');
    const finalPriceInput = document.getElementById('finalPriceInput');
    
    let checkInDate = null;
    let checkOutDate = null;

    // 2. Initialize Check-In Calendar
    const checkInPicker = flatpickr("#checkIn", {
        minDate: "today",          // BLOCKS PAST DATES
        disable: disableDates,     // BLOCKS ALREADY BOOKED DATES
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr, instance) {
            checkInDate = selectedDates[0];
            
            // BLOCKS CHECKING OUT BEFORE CHECKING IN
            if (checkInDate) {
                let nextDay = new Date(checkInDate);
                nextDay.setDate(nextDay.getDate() + 1);
                checkOutPicker.set('minDate', nextDay); 

                let maxCheckoutDay = new Date(checkInDate);
                maxCheckoutDay.setMonth(maxCheckoutDay.getMonth() + 1);
                checkOutPicker.set('maxDate', maxCheckoutDay);

                // UX Polish: If they already picked a checkout date that is now illegal, clear it!
                if (checkOutDate && (checkOutDate < nextDay || checkOutDate > maxCheckoutDay)) {
                    checkOutPicker.clear();
                    checkOutDate = null;
                }
            }
            calculateTotal();
        }
    });

    // 3. Initialize Check-Out Calendar
    const checkOutPicker = flatpickr("#checkOut", {
        minDate: "today",
        disable: disableDates,     // BLOCKS ALREADY BOOKED DATES
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr, instance) {
            checkOutDate = selectedDates[0];
            calculateTotal();
        }
    });

    function calculateTotal() {
        if (checkInDate && checkOutDate && checkOutDate > checkInDate) {
            const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
            const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
            const total = daysDifference * pricePerNight;
            const final = total + (total*0.05)
            
            displayTotal.innerText = final.toLocaleString("en-US");
            finalPriceInput.value = final;
        } else {
            displayTotal.innerText = "0";
            finalPriceInput.value = "0";
        }
    }

    checkInInput.addEventListener('change', calculateTotal);
    checkOutInput.addEventListener('change', calculateTotal);
});