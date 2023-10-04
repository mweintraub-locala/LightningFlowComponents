/**
 * 
 * By:      Eric Smith
 * Date:    10/04/23
 * Version: 1.0.0
 * 
 * LWC:         findCommonAndUnique
 * Controller:  FindCommonAndUniqueController, FindCommonAndUniqueControllerTest
 * Action:      FindCommonAndUniqueRecords
 *              Collection Processors (https://unofficialsf.com/list-actions-for-flow/)
 *       
**/

// Code commented this way is a standard part of the template and should stay as is
// * Code commented this way should be adjusted to fit your use case

// Standard lWC import
import { api, track, LightningElement } from 'lwc'; 
// Standard import for notifying flow of changes in attribute values
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';

// * Import the AuraEnabled Method from the Controller
import findCommonAndUnique from '@salesforce/apex/FindCommonAndUniqueController.findCommonAndUnique';

// * Define the name of the Component
export default class FindCommonAndUnique extends LightningElement {

        // * Define each of the LWC's attributes, with defaults if needed
        @api sourceRecordCollection;
        @api sourceUniqueID;
        @api sourceUniqueRecordCollection;
        @api sourceCommonRecordCollection;
        @api targetRecordCollection;
        @api targetUniqueID;
        @api targetUniqueRecordCollection;
        @api targetCommonRecordCollection;
        @api emptyListsReturnNull;
        
        // Define the attribute used to store an error message
        @api error;   
    
        // Track prior value(s) for reactive attributes
        @track oldReactiveValue; 
    
        // Get the Reactive Attribute Value
        get reactiveValue() { 
            // * Return reactive attributes as a string to be used in tracking
            return JSON.stringify(this.sourceRecordCollection) + JSON.stringify(this.targetRecordCollection) + this.sourceUniqueID + this.targetUniqueID;
        }
    
        // On rendering, check for a value or change in value of reactive attribute(s) and execute the handler
        renderedCallback() {
            if (this.reactiveValue && this.reactiveValue != this.oldReactiveValue) {
                this._callAuraEnabledMethod();
            }
        }
    
        // On a change in the reactive attribut(s), call the debounce handler for the AuraEnabledMethod handler
        handleOnChange() { 
            this._debounceHandler();
        }
    
        // Call the Aura Enabled Method in the Controller
        _callAuraEnabledMethod() {
            // * Identify the Aura Enabled Method
            findCommonAndUnique({ 
                // * For each attribute to be passed to the controller - methodAttributeName: value from LWC
                sourceRecordCollection: this.sourceRecordCollection,
                sourceUniqueID: this.sourceUniqueID,
                targetRecordCollection: this.targetRecordCollection,
                targetUniqueID: this.targetUniqueID,
                emptyListsReturnNull: this.emptyListsReturnNull
            })
    
            // If a valid result is returned,
            .then(result => { 
                // parse the result into individual attributes
                let returnResults = JSON.parse(result);
    
                // * LWC Output Attribute Name, value returned from the method
                this._fireFlowEvent("sourceUniqueRecordCollection", returnResults.sourceUniqueRecordCollection);
                this._fireFlowEvent("sourceCommonRecordCollection", returnResults.sourceCommonRecordCollection);
                this._fireFlowEvent("targetUniqueRecordCollection", returnResults.targetUniqueRecordCollection);
                this._fireFlowEvent("targetCommonRecordCollection", returnResults.targetCommonRecordCollection);

            })
    
            // This template includes a standard 'error' output attribute that will be exposed on the flow screen
            // If an error is returned, extract error message, and expose the error in the browser console
            .catch(error => { 
                this.error = error?.body?.message ?? JSON.stringify(error);
                console.error(error.body.message);
                this._fireFlowEvent("error", this.error);
            });
    
            // Save the current value(s) of the reactive attribute(s)
            this.oldReactiveValue = this.reactiveValue;
    
        }
    
        // Debounce the processing of the reactive changes
        _debounceHandler() {
            this._debounceTimer && clearTimeout(this._debounceTimer);
            if (this.reactiveValue){
                this._debounceTimer = setTimeout(() => this._callAuraEnabledMethod(), 300);
            }    
        }  
    
        // Dispatch the value of a changed attribute back to the flow
        _fireFlowEvent(attributeName, data) {
            this.dispatchEvent(new FlowAttributeChangeEvent(attributeName, data));
        }

}