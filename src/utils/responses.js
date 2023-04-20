export const formatData = (data) => {
    return data.map((item) => {
        return {
            id: item._id,
            name: item.name,
            email: item.email,
            role: item.role,
        };
    });
};

export const responseData = (data = [], status = 'OK', message = 'success') => {
    return {
        status,
        message,
        data,
    };
};
