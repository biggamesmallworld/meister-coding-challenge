import React, { Component } from 'react';
import Persons from './utils/Persons';
import Server from './Server';


let numPosted = 0;
let id = 0;
let personsPosted = [];

export default class Client extends Component {
    constructor() {
        super();

        this.state = {
            //persons: new Persons(),
            tempPersons: [],
        };
    }

    createPerson() {
        const person = {
            name: '',
            id: id,
        };

        let tempPersonsArray = this.state.tempPersons; //create shallow array in order to update state
        tempPersonsArray.push(person);
        id++;


        this.setState({tempPersons: tempPersonsArray}); //store persons in the state while the server is latent

    
    }

    onClickCreatePerson = () => {
        this.createPerson();
    }

    onClickSaveName(person) {
        this.savePerson(person);
    }

    onChangeName(person, event) {
        // on the input onchange events, make sure to update that state array, instead of the server directly
        const updatedName = event.target.value;

        let updatedTempPersonArray = this.state.tempPersons;

        updatedTempPersonArray.forEach(item => {
            if(item.id === person.id) {
                item.name = updatedName;
            }
        });


        this.setState({tempPersons: updatedTempPersonArray}); //set shallow array to the state

    }

    savePerson(person) {

        let postId;

        if(!personsPosted.includes(person)) { //check if the person has not already been posted
            postId = numPosted; //if not, then add it with an id to match the server generated id
        } else {
            postId = personsPosted.indexOf(person); //if so, then set the personToPost id to the index of it in the array, so it can patch correctly
        }

        let personToPost = { //create an object that will match what the server will return, so we can check later
            name: person.name,
            id: postId,
        };


        let personsArray = this.state.persons.state; //set array from the state
        let shouldPatch = false; //set default patch value to false


        if(personsArray.length === 0 && personsPosted.length === 0) { //check if there are any persons yet, if not then post one
            Server['post'](personToPost).then(this.onSaveSuccess);
            personsPosted.push(person);
            numPosted++;
        } else if(personsArray.includes(personToPost)) {//if it has been saved in the server, then patch
            Server['patch'](person).then(this.onSaveSuccess);
        } else { // first check if the person has already been posted via the local array, and if so, then patch, otherwise, post
            //loop through the whole personsPosted array, if there is a match of the element's id, then post
            personsPosted.forEach(item => {
                if(item.id === person.id) {
                    shouldPatch = true; //element was found, trigger patch
                }
            });

            if(shouldPatch) {
                Server['patch'](personToPost).then(this.onSaveSuccess);
            } else {
                Server['post'](personToPost).then(this.onSaveSuccess);
                personsPosted.push(person);
                numPosted++;
            }
        }
    

    }

    onSaveSuccess = person => {
        this.setState(state => ({
            persons: state.persons.upsert(person),
        }));
        console.log('From server', this.state.persons.get());
    }

    renderServerData() { //render the data the server currently has
        return this.state.persons
            .get()
            .map(person => (
                <div key={person.id} className="challenge-person">
                    <p><span>id: {person.id}</span> <span>name: {person.name}</span></p>
                </div>
            ))
    }

    renderTempPersons() { //render the state array of persons that are on the screen    
        return this.state.tempPersons
            .map(person => (
                <div key={person.id} className="challenge-person">
                    <p><span>id: {person.id}</span> <span>name: {person.name}</span></p>
                </div>
            ))
    }

    renderPersons() {
        if(this.state.tempPersons.length) {
            return this.state.tempPersons
            .map(person => (
                <div key={person.id} className="challenge-person">
                    <span className="challenge-person-id">
                        {person.id}
                    </span>
                    <input
                        value={person.name}
                        className="challenge-person-name"
                        onChange={event => this.onChangeName(person, event)}
                    />
                    <button
                        className="challenge-person-save-name-button"
                        onClick={() => this.onClickSaveName(person)}
                    >
                        Save Name
                    </button>
                </div>
            ));
        } else {
            return null;
        }
        
    }

    render() {
        return (
            <div className="challenge">
                <button
                    className="challenge-create-person-button"
                    onClick={this.onClickCreatePerson}
                >
                    Create Person
                </button>
                <div className="challenge-persons">
                    {this.renderPersons()}
                </div>
                <div className="challenge-persons">
                    <h2>Server Data</h2>
                    {this.renderServerData()}
                </div>
                <div className="challenge-persons">
                    <h2>Temp Persons Array</h2>
                    {this.renderTempPersons()}
                </div>
            </div>
        );
    }
}