const { getRedis } = require('../dbs/init.redis');

const { promisify } = require('util');

const cacheBreakdownHandler = async (key, fetchFromDB) => {
    const client = getRedis().instanceConnect;
    const getAsync = promisify(client.get).bind(client);
    const setAsync = promisify(client.set).bind(client);

    // Kiểm tra cache
    const cacheData = await getAsync(key);
    if (cacheData) {
        return JSON.parse(cacheData);
    }

    // Khóa mutex
    const lockKey = `lock:${key}`;
    const lock = await client.set(lockKey, 'locked', 'NX', 'EX', 10);  // Khóa có TTL 10 giây

    if (lock) {
        // Lấy dữ liệu từ cơ sở dữ liệu
        const data = await fetchFromDB(key);

        // Lưu vào cache
        await setAsync(key, JSON.stringify(data), 'EX', 3600);  // TTL 1 giờ

        // Giải phóng khóa
        await client.del(lockKey);

        return data;
    } else {
        // Chờ một khoảng thời gian ngắn và kiểm tra lại cache
        await new Promise(resolve => setTimeout(resolve, 50));
        return await cacheBreakdownHandler(key, fetchFromDB);
    }
};

module.exports = cacheBreakdownHandler;
