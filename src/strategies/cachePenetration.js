const { getRedis } = require('../dbs/init.redis');

const { checkKey, addKey } = require('./bloomFilter');

const cachePenetrationHandler = async (key, fetchFromDB) => {
    const client = getRedis().instanceConnect;

    // Kiểm tra key với Bloom Filter
    if (!checkKey(key)) {
        console.log(`Key ${key} không tồn tại theo Bloom Filter`);
        return null;
    }

    // Kiểm tra cache
    const cacheData = await client.get(key);
    if (cacheData) {
        return JSON.parse(cacheData);
    }

    // Lấy dữ liệu từ cơ sở dữ liệu
    const data = await fetchFromDB(key);

    // Lưu vào cache, ngay cả khi giá trị là null
    if (data) {
        await client.set(key, JSON.stringify(data), 'EX', 3600);  // TTL 1 giờ
    } else {
        await client.set(key, JSON.stringify(null), 'EX', 60);  // TTL 1 phút cho giá trị null
    }

    return data;
};

module.exports = cachePenetrationHandler;
