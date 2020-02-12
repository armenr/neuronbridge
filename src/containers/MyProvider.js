import React, { Component } from 'react';
import MyContext from './MyContext';

class MyProvider extends Component {
    state = {
        open: false,
        test: 'This is a test'
    };

    render() {
        return (
            <MyContext.Provider
                value={{
                    open: this.state.open,
                    handleClickOpen: event => {
                        console.log('use context open');
                        const open = true;
                        this.setState({
                            open
                        })
                    },
                    handleClose: event => {
                        console.log('use context close');
                        const open = false;
                        this.setState({
                            open
                        });
                    }
                }}
            >
                {this.props.children}
            </MyContext.Provider>
        );
    }
}

export default MyProvider;