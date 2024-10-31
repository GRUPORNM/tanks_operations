sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter"
],
    function (BaseController, JSONModel, formatter) {
        "use strict";

        return BaseController.extend("tanksoperations.controller.CreateOperation", {

            formatter: formatter,

            onInit: function () {
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0,
                });

                this.setModel(oViewModel, "createOperation");
            },

            onAfterRendering: function () {
                if (this.getModel("appView").getProperty("/fromLaunchpad")) {
                    var that = this;
                    sessionStorage.setItem("goToLaunchpad", "");
                    window.addEventListener("message", function (event) {
                        var data = event.data;
                        if (data.action == "goToMainPage") {
                            that.onNavBack();
                        }
                    });
                } else {

                }
            },

            onCreateTankOperation: function () {
                var aControl = [],
                    aContainers = [],
                    oEntry;

                aControl.push(sap.m.Input, sap.m.DatePicker, sap.m.Select);
                aContainers.push("GeneralInfoContainer");

                var oHeaderFieldsChecked = this.checkEmptyFields(aControl, aContainers, ""),
                    oURLParams = new URLSearchParams(window.location.search),
                    oToken = oURLParams.get('token');

                oEntry = {
                    type: this.byId("type").getSelectedKey(),
                    src_tank: this.byId("src_tank").getSelectedKey(),
                    planned_date: this.byId("planned_date").getDateValue(),
                };

                if (this.byId("type").getSelectedKey() == '1') {
                    oEntry.dest_tank = this.byId("src_tank").getSelectedKey();
                    oEntry.operation_time = this.byId("operation_time").getValue();
                } else {
                    oEntry.dest_tank = this.byId("dest_tank").getSelectedKey();
                    oEntry.quantity = this.byId("quantity").getValue();
                }

                if (oHeaderFieldsChecked && oEntry) {
                    var sPath = "/xTQAxTANKS_OPERATIONS_DD";

                    this.onCreate(sPath, oEntry, oToken);
                }
            },

            onOpenMessageBox: function (oAction) {
                var oMessage = {
                    oTitle: "",
                    oText: ""
                }

                switch (oAction) {
                    case "D":
                        oMessage.oTitle = this.getResourceBundle().getText("alertMessageTitle");
                        oMessage.oText = this.getResourceBundle().getText("deleteRowFromOperationDocumentation");
                        break;
                }

                this.showAlertMessage(oMessage, oAction);
            },

            onChangeType: function () {
                this.byId("dest_tank").setProperty("visible", !(this.byId("type").getSelectedKey() == '1'));
                this.byId("operation_time").setProperty("visible", !(this.byId("type").getSelectedKey() == '2'));
                this.byId("quantity").setProperty("visible", !(this.byId("type").getSelectedKey() == '1'));
            },

            onChangeTank: function (oValue) {
                var oMessage = {
                    oTitle: this.getResourceBundle().getText("alertTankTitle"),
                    oText: this.getResourceBundle().getText("alertTankText")
                }

                if (this.byId("type").getSelectedKey() == "2") {
                    var sSrcTankValue = this.byId("src_tank").getSelectedKey(),
                        sDestTankValue = this.byId("dest_tank").getSelectedKey();

                    if (sSrcTankValue && sDestTankValue && sSrcTankValue === sDestTankValue) {
                        this.showErrorMessage(oMessage);
                        if (oValue === '1') {
                            this.byId("src_tank").setSelectedKey(null);
                        } else {
                            this.byId("dest_tank").setSelectedKey(null);
                        }
                    }
                }
            }

        });
    });
