<!DOCTYPE HTML>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="A cross-platform financial charting application to showcase the functionality of d3fc components">
    <title>d3fc Showcase</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <!-- Version: <%- version %> -->
</head>
<body>
<div class="container" id="app-container">
    <div class="row row-offcanvas-right head-menu head-row">
        <div class="col-xs-12 col-sm-12 col-md-9 head-sub-row">
            <div id="product-dropdown" class="dropdown">
                <button id="product-dropdown-button" class="dropdown-toggle" type="button" data-toggle="dropdown"></button>
            </div>
            <div id="reset-button">
                <button class="btn btn-default" type="button">Reset</button>
            </div>
            <div id="period-selector"></div>
        </div>
        <div class="col-xs-4 col-sm-4 col-md-3 sidebar-offcanvas">
        </div>
    </div>
    <div class="row row-offcanvas-right primary-row">
        <div class="col-xs-12 col-sm-12 col-md-9 col-chart">
            <div id="legend"></div>
            <svg id="charts-container" layout-style="flexDirection: column">
                <g id="primary-row" layout-style="flex: 5; flexDirection: row" >
                    <svg id="primary-container" layout-style="flex: 1"></svg>
                </g>
                <g class="secondary-row" layout-style="flex: 1; flexDirection: row">
                    <svg class="secondary-container" layout-style="flex: 1"></svg>
                </g>
                <g class="secondary-row" layout-style="flex: 1; flexDirection: row">
                    <svg class="secondary-container" layout-style="flex: 1"></svg>
                </g>
                <g class="secondary-row" layout-style="flex: 1; flexDirection: row">
                    <svg class="secondary-container" layout-style="flex: 1"></svg>
                </g>
                <g id="x-axis-row" layout-style="height: 20; flexDirection: row" >
                    <svg id="x-axis-container" layout-style="flex: 1"></svg>
                </g>
                <g id="navbar-row" layout-style="minHeight: 100; flexDirection: row">
                    <svg id="navbar-container" layout-style="flex: 1"></svg>
                </g>
            </svg>
        </div>
        <div class="col-xs-4 col-sm-4 col-md-3 sidebar-offcanvas sidebar-menu">
            <div class="series-buttons btn-group"></div>
            <div class="y-value-accessor-buttons btn-group"></div>
            <div class="indicator-buttons btn-group"></div>
            <div class="secondary-chart-buttons btn-group"></div>
        </div>
    </div>
</div>
<script src="<%- appJsPath %>"></script>
<%= liveReload === true ? '<script src="//localhost:35729/livereload.js"></script>' : '' %>
</body>
</html>
