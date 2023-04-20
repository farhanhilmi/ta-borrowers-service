import createBorrower from './profile/create.js';

export default (payload) => {
    try {
        console.log('Triggering.... Customer Events');

        payload = JSON.parse(payload);
        console.log('event.... payload', payload);

        const { event, data } = payload;

        const { userId, roles, order, qty } = data;

        switch (event) {
            // case 'ADD_TO_WISHLIST':
            case 'VERIFY_NEW_ACCOUNT':
                createBorrower(userId);
                break;
            // case 'ADD_TO_CART':
            //     this.ManageCart(userId, product, qty, false);
            //     break;
            // case 'REMOVE_FROM_CART':
            //     this.ManageCart(userId, product, qty, true);
            //     break;
            // case 'CREATE_ORDER':
            //     this.ManageOrder(userId, order);
            //     break;
            default:
                console.log('No event found!');
                break;
        }
    } catch (error) {
        throw error;
    }
};
