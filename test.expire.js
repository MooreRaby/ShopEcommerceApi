const jwtPayload = {
    "userId": "660e2751a029e91e84584c21",
    "email": "nike@gmail.com",
    "iat": 1712367167,
    "exp": 1712487167
};

// Convert timestamps (seconds since Epoch) to milliseconds
const iatTimestampMs = jwtPayload.iat * 1000;
const expTimestampMs = jwtPayload.exp * 1000;

// Create Date objects from timestamps
const iatDate = new Date(iatTimestampMs);
const expDate = new Date(expTimestampMs);

// Format dates as strings
const iatDateString = iatDate.toDateString(); // Ngày tạo
const expDateString = expDate.toDateString(); // Ngày hết hạn

console.log("Ngày tạo:", iatDateString);
console.log("Ngày hết hạn:", expDateString);
