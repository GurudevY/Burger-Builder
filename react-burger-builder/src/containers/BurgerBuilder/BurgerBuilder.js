import React, { Component } from 'react';

import Aux from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders';

const INGREDIENT_PRICES = {
    salad: 30,
    cheese: 25,
    meat: 90,
    bacon: 75
}

class BurgerBuilder extends Component {
    // constructor(props) {
    //     super(props)
    //     this.state={...}
    // }

    state = {
        ingredients: null,
        totalPrice: 100,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    componentDidMount() {

        console.log(this.props)
        axios.get('ingredients.json')
            .then(response => {
                this.setState({
                    ingredients: response.data
                })
            }).catch(err => {
                this.setState({ error: true })
            })
    }

    updatePurchaseState(ingredients) {

        // Get the array of string entries
        const sum = Object.keys(ingredients)
            // then loop thru and replace with numbers.
            .map(igKey => {
                return ingredients[igKey]
            })
            // Then add them up where starting value is zero.
            .reduce((tot, el) => {
                return tot + el;
            }, 0);

        // Then set state of purchasable based on sum
        this.setState({ purchasable: sum > 0 });
    }

    addIngredientHandler = (type) => {
        const oldState = this.state.ingredients[type];
        const updatedCount = oldState + 1;
        const updatedIngredients = {
            ...this.state.ingredients
        }
        updatedIngredients[type] = updatedCount;

        const priceAddition = INGREDIENT_PRICES[type];
        const newPrice = this.state.totalPrice + priceAddition;
        console.log(priceAddition, newPrice)

        this.setState({
            ingredients: updatedIngredients,
            totalPrice: newPrice
        })
        this.updatePurchaseState(updatedIngredients);
    }

    removeIngredientHandler = (type) => {

        const oldState = this.state.ingredients[type];
        if (oldState <= 0) {
            return;
        }

        const updatedCount = oldState - 1;
        const updatedIngredients = {
            ...this.state.ingredients
        }
        updatedIngredients[type] = updatedCount;

        const priceAddition = INGREDIENT_PRICES[type];
        const newPrice = this.state.totalPrice - priceAddition;

        this.setState({
            ingredients: updatedIngredients,
            totalPrice: newPrice
        })
        this.updatePurchaseState(updatedIngredients);
    }

    purchaseHandler = () => {
        this.setState({ purchasing: true });
    }

    purchaseCancellHandler = () => {
        this.setState({ purchasing: false });
    }

    purchaseContinueHandler = () => {


        const queryParams = [];

        for (let i in this.state.ingredients) {
            queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.state.ingredients[i]))
        }
        queryParams.push('price=' + this.state.totalPrice);

        const queryStrings = queryParams.join('&');

        this.props.history.push({
            pathname: '/checkout',
            search: '?' + queryStrings
        });
    }

    render() {

        const disableInfo = {
            ...this.state.ingredients
        };

        for (let key in disableInfo) {
            disableInfo[key] = disableInfo[key] <= 0
        }
        // Example {salad: true, meat: false, cheese: false, bacon: true}
        let orderSummary = null;

        // Intially set the burger to spinner.
        let burger = this.state.error ? <p>Ingredients can't be loaded</p> : <Spinner />;

        // Set burger only afer fetching the data from firebase.
        if (this.state.ingredients) {

            burger = (
                <Aux>
                    <Burger ingredients={this.state.ingredients} />

                    <BuildControls
                        ingredientAdded={this.addIngredientHandler}
                        ingredientRemoved={this.removeIngredientHandler}
                        disabled={disableInfo}
                        purchasable={this.state.purchasable}
                        price={this.state.totalPrice}
                        purchaseHandler={this.purchaseHandler} />
                </Aux>
            );

            orderSummary = <OrderSummary
                ingredients={this.state.ingredients}
                purchaseCancelled={this.purchaseCancellHandler}
                purchaseContinue={this.purchaseContinueHandler}
                price={this.state.totalPrice} />;
        }

        // Show spinner if loading.
        if (this.state.loading) {
            orderSummary = <Spinner />
        }

        return (
            <Aux>
                <Modal
                    show={this.state.purchasing}
                    modalClosed={this.purchaseCancellHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>

        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);