import createBorrower from './profile/create.js';
import updateBorrowerStatus from './updateBorrowerStatus.js';

export default (payload) => {
    try {
        console.log('Triggering.... Borrower Events');

        payload = JSON.parse(payload);
        console.log('payload', payload);

        const { event, data } = payload;

        const { userId, status, order, qty } = data;

        switch (event) {
            // case 'ADD_TO_WISHLIST':
            case 'VERIFY_NEW_ACCOUNT':
                createBorrower(userId);
                break;
            case 'UPDATE_BORROWER_STATUS':
                updateBorrowerStatus(userId, status);
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
