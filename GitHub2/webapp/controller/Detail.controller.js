sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(BaseController) {
	"use strict";

	return BaseController.extend("GitHubGitHub.controller.Detail", {
		/**
		@Init function to handle the routing
		**/
		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("object").attachMatched(this._onRouteMatched, this);
		},
		/**
		@Method  
		to fetch the item data and bind it to the detail page
		**/
		_onRouteMatched: function(oEvent) {
			var oArgs, oView;
			oArgs = oEvent.getParameter("arguments");
			oView = this.getView();
			oView.bindElement({
				path: "/items(" + oArgs.objectId + ")",
				events: {
					dataRequested: function() {
						oView.setBusy(true);
					},
					dataReceived: function() {
						oView.setBusy(false);
					}
				}
			});
		}

	});

});