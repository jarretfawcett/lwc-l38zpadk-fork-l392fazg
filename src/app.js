import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import search from '@salesforce/apex/SearchController.search';
import updateContact from '@salesforce/apex/searchAddContactsToAccount.updateContact';
const DELAY = 300;
export default class anyname extends LightningElement {
    @api recordId;
    placeholder = 'Search';
    fields = ['Name', 'Email', 'Phone', 'AccountId'];
    @track error;
    searchTerm;
    delayTimeout;
    @track searchRecords;
    objectLabel = 'Contact';
    isLoading = false;
    ICON_URL = '/apexpages/slds/latest/assets/icons/standard-sprite/svg/symbols.svg#contact';

    handleInputChange(event) {
        //console.log(this.fields);
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        this.isLoading = true;
        this.delayTimeout = setTimeout(() => {
            if (searchKey.length >= 2) {
                search({
                    objectName: this.objectLabel,
                    fields: this.fields,
                    searchTerm: searchKey
                })
                    .then(result => {
                        let stringResult = JSON.stringify(result);
                        let allResult = JSON.parse(stringResult);
                        allResult.forEach(record => {
                            record.FIELD1 = record['Name'];
                            record.FIELD2 = record['Email'];
                            record.FIELD3 = record['Phone'];
                            record.FIELD4 = this.accountIdCheck(record['AccountId']);
                        });
                        this.searchRecords = allResult;

                    })
                    .catch(error => {
                        console.error('Error:', error);
                    })
                    .finally(() => {
                        this.isLoading = false;
                    });
            }
        }, DELAY);
    }
    addtoaccount(event) {
        let selectedConId = event.target.value;
        updateContact({
            cId: selectedConId,
            accId: this.recordId
        })
            .then(result => {
                this.error = undefined;
                const evt = new ShowToastEvent({
                    title: 'Updated!',
                    message: 'Contact Updated Successfully!',
                    variant: 'success',
                });
                this.dispatchEvent(evt);
                //console.log(this.searchRecords);
                for (var i = 0; i < this.searchRecords.length; i++) {
                    if (this.searchRecords[i].Id === selectedConId) {
                        //console.log(this.searchRecords[i].FIELD4);
                        this.searchRecords[i].FIELD4 = true;
                        //console.log(this.searchRecords[i].FIELD4);
                    }
                }
                eval("$A.get('e.force:refreshView').fire();");
            })
            .catch(error => {
                console.error('Error:', error);
            })
    }
    accountIdCheck(accId) {
        if (accId === this.recordId)
            return true;
        return false
    }
}