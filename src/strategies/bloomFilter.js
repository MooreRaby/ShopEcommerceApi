const BloomFilter = require('bloom-filter');

const bloomFilter = new BloomFilter(1000, 4);

// Hàm kiểm tra key với Bloom Filter
const checkKey = (key) => {
    return bloomFilter.test(key);
};

// Hàm thêm key vào Bloom Filter
const addKey = (key) => {
    bloomFilter.add(key);
};

module.exports = {
    checkKey,
    addKey
};
