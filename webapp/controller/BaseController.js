sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
    "use strict";

    var TQAModel;

    return Controller.extend("tanksoperations.controller.BaseController", {
        getModelTQA: function () {
            return TQAModel;
        },

        setModelTQA: function (token) {
            var userLanguage = sessionStorage.getItem("oLangu");
            if (!userLanguage) {
                userLanguage = "EN";
            }
            var serviceUrlWithLanguage = this.getModel().sServiceUrl + (this.getModel().sServiceUrl.includes("?") ? "&" : "?") + "sap-language=" + userLanguage;

            TQAModel = new sap.ui.model.odata.v2.ODataModel({
                serviceUrl: serviceUrlWithLanguage,
                annotationURI: "/zsrv_iwfnd/Annotations(TechnicalName='%2FTQA%2FOD_TANKS_OPERATION_ANNO_MDL',Version='0001')/$value/",
                headers: {
                    "authorization": token,
                    "applicationName": "STOCK_MANAGE"
                }
            });

            var vModel = new sap.ui.model.odata.v2.ODataModel({
                serviceUrl: "/sap/opu/odata/TQA/OD_VARIANTS_MANAGEMENT_SRV",
                headers: {
                    "authorization": token,
                    "applicationName": "STOCK_MANAGE"
                }
            });
            this.setModel(vModel, "vModel");
            this.setModel(TQAModel);
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onNavBack: function () {
            sessionStorage.setItem("goToLaunchpad", "X");
            var aContainers = [];
            aContainers.push("GeneralInfoContainer");

            if (this.byId("requestDetailPage").getParent().getBindingContext()) {
                var aButtons = [],
                    oConfirmButton = {
                        id: "ConfirmButton",
                        visible: false
                    },
                    oEditButton = {
                        id: "EditButton",
                        visible: true
                    },
                    oCancelButton = {
                        id: "CancelButton",
                        visible: false
                    };

                aButtons.push(oConfirmButton, oEditButton, oCancelButton);

                this.onManageButtonsState(aButtons);
                this.onManageContainerFieldsState("GeneralInfo", false);

                this.onNavigation("", "RouteMain", "");
            } else {
                var oContainerDataCleared = this.onClearContainersData(aContainers)

                if (oContainerDataCleared) {
                    this.onNavigation("", "RouteMain", "");
                }
            }
        },

        onNavigation: function (sPath, oRoute, oEntityName) {
            if (sPath) {
                this.getRouter().navTo(oRoute, {
                    objectId: sPath.replace(oEntityName, "")
                }, false, true);
            } else {
                this.getRouter().navTo(oRoute, {}, false, true);
            }
        },

        onObjectMatched: function (oEvent) {
            this.getUserAuthentication();
            this.onBindView("/" + oEvent.getParameter("config").pattern.replace("/{objectId}", "") + oEvent.getParameter("arguments").objectId);
        },

        onBindView: function (sObjectPath) {
            this.getView().bindElement({
                path: sObjectPath,
                change: this.onBindingChange.bind(this),
                events: {
                    dataRequested: function () {
                        this.getModel("appView").setProperty("/busy", true);
                    }.bind(this),
                    dataReceived: function () {
                        this.getModel("appView").setProperty("/busy", false);
                    }.bind(this)
                }
            });
        },

        onBindingChange: function () {
            var oView = this.getView(),
                oElementBinding = oView.getElementBinding();

            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("notFound");

                return;
            }
        },

        onValidateEditedFields: function (oContainer, oObject) {
            var oEdited = false;
            this.byId(oContainer).getContent().forEach(oField => {

                if (oField instanceof sap.m.Input) {

                    if (oField.getValue() != oObject[oField.getName()]) {
                        oEdited = true;
                    }

                }
                else if (oField instanceof sap.m.DatePicker) {
                    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: 'dd.MM.yyyy' });

                    if (oField.getValue() != oDateFormat.format(oObject[oField.getName()])) {
                        oEdited = true;
                    }

                }
                else if (oField instanceof sap.m.Select) {

                    if (oField.getSelectedKey() != oObject[oField.getName()]) {
                        oEdited = true;
                    }

                }
            });

            if (oEdited) {
                return true;
            } else {
                return false;
            }
        },

        onValidateEditedFieldsHeader: function (oContainer, oObject) {
            var oEdited = false;
            this.byId(oContainer).getContent().forEach(oField => {
                if (oField instanceof sap.m.Input) {
                    if (oField.getValue() != oObject[oField.getName()]) {
                        oEdited = true;
                    }
                }
                else if (oField instanceof sap.m.Select) {

                    if (oField.getSelectedKey() != oObject[oField.getName()]) {
                        oEdited = true;
                    }

                }

            });

            if (oEdited) {
                return true;
            } else {
                return false;
            }
        },

        onManageButtonsState: function (aButtons) {
            if (aButtons.length > 0) {

                aButtons.forEach(oButton => {
                    sap.ui.getCore().byId(oButton.id).setVisible(oButton.visible);
                });

            }
        },

        onManageContainerFieldsState: function (oContainer, sState) {
            this.byId(oContainer).getContent().forEach(oField => {

                if (oField instanceof sap.m.Input || oField instanceof sap.m.Select || oField instanceof sap.m.DatePicker) {
                    oField.setEnabled(sState);
                    oField.setValueState("None")
                }

            });
        },

        onClearContainersData: function (aContainers) {
            try {
                aContainers.forEach(oContainer => {
                    var oForm = this.byId(oContainer);

                    oForm.getContent().forEach(oElement => {
                        if (oElement instanceof sap.m.Input || oElement instanceof sap.m.DatePicker || oElement instanceof sap.m.TimePicker) {
                            oElement.setValue(null);
                            oElement.setValueState("None");
                            oElement.setValueStateText(null);
                        } else if (oElement instanceof sap.m.Select) {
                            oElement.setSelectedKey(null);
                        }
                    });
                });

                return true;
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        getFields: function (aControl, aContainers, oMainControl) {
            this.aFields = [];
            aContainers.forEach(oContainer => {

                for (let i = 0; i < aControl.length; i++) {

                    if (oMainControl == "Dialog") {
                        var aContainerFields = sap.ui.getCore().byId(oContainer).getContent().filter(function (oControl) {
                            return oControl instanceof aControl[i];
                        });

                        aContainerFields.forEach(oContainerField => {
                            var oField = {
                                id: "",
                                value: ""
                            };

                            oField.id = oContainerField.getName();

                            try {
                                oField.value = oContainerField.getValue()
                            } catch (error) {
                                oField.value = oContainerField.getSelectedKey();
                            }

                            this.aFields.push(oField);
                        });
                    } else {
                        var aContainerFields = this.byId(oContainer).getContent().filter(function (oControl) {
                            return oControl instanceof aControl[i];
                        });

                        aContainerFields.forEach(oContainerField => {
                            var oField = {
                                id: "",
                                value: ""
                            };

                            oField.id = oContainerField.getName();

                            try {
                                oField.value = oContainerField.getValue();
                            } catch (error) {
                                oField.value = oContainerField.getSelectedKey();
                            }

                            this.aFields.push(oField);
                        });
                    }

                }

            });

            return this.aFields;
        },

        checkEmptyFields: function (aControl, aContainers, oMainControl) {
            this.getFields(aControl, aContainers, oMainControl);
            this.checked = true;

            if (this.aFields.length > 0) {

                this.aFields.forEach(oField => {
                    if (oMainControl == "Dialog") {
                        var oControl = sap.ui.getCore().byId(oField.id);
                    } else {
                        var oControl = sap.ui.getCore().byId(oField.id);
                    }

                    if (oControl) {
                        if (oControl.getProperty("enabled") && oControl.getProperty("visible")) {
                            try {
                                if (oControl.getValue() == "") {
                                    oControl.setValueState("Error");
                                    this.checked = false;
                                } else {
                                    oControl.setValueState("None");
                                }
                            } catch (error) {
                                if (oControl.getSelectedKey() == "") {
                                    oControl.setValueState("Error");
                                    this.checked = false;
                                } else {
                                    oControl.setValueState("None");
                                }
                            }
                        }
                    }
                });

                if (this.checked) {
                    return true;
                } else {
                    return false;
                }
            }
        },

        showAlertMessage: function (oMessage, pAction) {
            var that = this;
            new sap.m.MessageBox.warning(oMessage.oText, {
                title: oMessage.oTitle,
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                emphasizedAction: sap.m.MessageBox.Action.OK,
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        switch (pAction) {
                            case 'R':
                                var aContainers = [];
                                aContainers.push("GeneralInfoContainer");

                                var oContainerDataCleared = that.onClearContainersData(aContainers);

                                if (oContainerDataCleared) {
                                    that.onNavigation("", "RouteMain", "");
                                }
                                break;
                        }

                    }
                }
            });
        },

        showErrorMessage: function (oMessage) {
            new sap.m.MessageBox.error(oMessage.oText, {
                title: oMessage.oTitle,
                actions: [sap.m.MessageBox.Action.OK],
                emphasizedAction: sap.m.MessageBox.Action.OK
            });
        },

        showSuccessMessage: function (oMessage) {
            new sap.m.MessageBox.success(this.getResourceBundle().getText(oMessage.oText), {
                title: this.getResourceBundle().getText(oMessage.oTitle),
                actions: [sap.m.MessageBox.Action.OK],
                emphasizedAction: sap.m.MessageBox.Action.OK,
            });
        },

        onCreate: function (sPath, oEntry, oToken) {
            try {
                if (sPath) {
                    var oModel = this.getModel(),
                        oAppViewModel = this.getModel("appView"),
                        that = this;

                    oModel.create(sPath, oEntry, {
                        headers: {
                            "authorization": oToken
                        },
                        success: function () {
                            var aContainers = [];
                            aContainers.push("GeneralInfoContainer")

                            var oContainersDataCleared = that.onClearContainersData(aContainers);

                            if (oContainersDataCleared) {
                                oModel.refresh(true);
                                that.onNavigation("", "RouteMain", "");
                            }
                        },
                        error: function (oError) {
                            var sError = JSON.parse(oError.responseText).error.message.value;

                            sap.m.MessageBox.alert(sError, {
                                icon: "ERROR",
                                onClose: null,
                                styleClass: '',
                                initialFocus: null,
                                textDirection: sap.ui.core.TextDirection.Inherit
                            });
                        }
                    });

                    oModel.attachRequestSent(function () {
                        oAppViewModel.setProperty("/busy", true);
                    });
                    oModel.attachRequestCompleted(function () {
                        oAppViewModel.setProperty("/busy", false);
                    });
                    oModel.attachRequestFailed(function () {
                        oAppViewModel.setProperty("/busy", false);
                    });
                }
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        onUpdate: function (sPath, oEntry, oToken) {
            var that = this;
            try {
                if (sPath) {
                    var oModel = this.getModel(),
                        oAppViewModel = this.getModel("appView"),
                        oMessage = {
                            oText: "operationUpdateText",
                            oTitle: "operationUpdateTitle"
                        };

                    oModel.update(sPath, oEntry, {
                        headers: {
                            "authorization": oToken
                        },
                        success: function () {
                            oModel.refresh(true);
                            that.showSuccessMessage(oMessage);
                        },
                        error: function (oError) {
                            var sError = JSON.parse(oError.responseText).error.message.value;

                            sap.m.MessageBox.alert(sError, {
                                icon: "ERROR",
                                onClose: null,
                                styleClass: '',
                                initialFocus: null,
                                textDirection: sap.ui.core.TextDirection.Inherit
                            });
                        }
                    });

                    oModel.attachRequestSent(function () {
                        oAppViewModel.setProperty("/busy", true);
                    });
                    oModel.attachRequestCompleted(function () {
                        oAppViewModel.setProperty("/busy", false);
                    });
                    oModel.attachRequestFailed(function () {
                        oAppViewModel.setProperty("/busy", false);
                    });
                }
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        onDelete: function (sPath, oToken) {
            var that = this;
            try {
                if (sPath) {
                    var oModel = this.getModel(),
                        oAppViewModel = this.getModel("appView"),
                        oMessage = {
                            oText: "operationDeletedText",
                            oTitle: "operationDeletedTitle"
                        };

                    oModel.remove(sPath, {
                        headers: {
                            "authorization": oToken
                        },
                        success: function () {
                            oModel.refresh(true);
                            that.showSuccessMessage(oMessage);
                        },
                        error: function (oError) {
                            var sError = JSON.parse(oError.responseText).error.message.value;

                            sap.m.MessageBox.alert(sError, {
                                icon: "ERROR",
                                onClose: null,
                                styleClass: '',
                                initialFocus: null,
                                textDirection: sap.ui.core.TextDirection.Inherit
                            });
                        }
                    });

                    oModel.attachRequestSent(function () {
                        oAppViewModel.setProperty("/busy", true);
                    });
                    oModel.attachRequestCompleted(function () {
                        oAppViewModel.setProperty("/busy", false);
                    });
                    oModel.attachRequestFailed(function () {
                        oAppViewModel.setProperty("/busy", false);
                    });
                }
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        getUserAuthentication: function (type) {
            var that = this,
                urlParams = new URLSearchParams(window.location.search),
                token = urlParams.get('token');

            if (token != null) {
                var headers = new Headers();
                headers.append("X-authorization", token);

                var requestOptions = {
                    method: 'GET',
                    headers: headers,
                    redirect: 'follow'
                };

                fetch("/sap/opu/odata/TQA/AUTHENTICATOR_SRV/USER_AUTHENTICATION", requestOptions)
                    .then(function (response) {
                        if (!response.ok) {
                            throw new Error("Ocorreu um erro ao ler a entidade.");
                        }
                        return response.text();
                    })
                    .then(function (xml) {
                        var parser = new DOMParser(),
                            xmlDoc = parser.parseFromString(xml, "text/xml"),
                            successResponseElement = xmlDoc.getElementsByTagName("d:SuccessResponse")[0],
                            response = successResponseElement.textContent;

                        if (response != 'X') {
                            that.getRouter().navTo("NotFound");
                        }
                        else {
                            that.getModel("appView").setProperty("/token", token);
                        }
                    })
                    .catch(function (error) {
                        console.error(error);
                    });
            } else {
                that.getRouter().navTo("NotFound");
                return;
            }
        },
    });
});