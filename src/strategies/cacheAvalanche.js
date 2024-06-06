const { getRedis } = require('../dbs/init.redis');
const { promisify } = require('util');

const cacheAvalancheHandler = async (key, fetchFromDB) => {
    const client = getRedis().instanceConnect;
    const getAsync = promisify(client.get).bind(client);
    const setAsync = promisify(client.set).bind(client);

    // Kiểm tra cache
    const cacheData = await getAsync(key);
    if (cacheData) {
        return JSON.parse(cacheData);
    }

    // Lấy dữ liệu từ cơ sở dữ liệu
    const data = await fetchFromDB(key);

    // Thiết lập TTL ngẫu nhiên
    const ttl = Math.floor(Math.random() * (3600 - 1800 + 1) + 1800);  // TTL ngẫu nhiên từ 30 phút đến 1 giờ
    await setAsync(key, JSON.stringify(data), 'EX', ttl);

    return data;
};

module.exports = cacheAvalancheHandler;
