export const sendResponse = (res, data = {}, message = 'Success', status = 200) => {
    res.status(status).json({
        status,
        message,
        data
    });
};

export const sendPaginatedResponse = (res, items = [], page = 1, limit = 10, total = 0, message = 'Success', status = 200) => {
    res.status(status).json({
        status,
        message,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        },
        data: items
    });
};