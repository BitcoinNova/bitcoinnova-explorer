var block,
Difficulties = [],
Blocks = [],
Rewards = [],
Txses = [],
Sizes = [],
Timestamps = [],
diffChart;

currentPage = {
destroy: function() {
    if (xhrGetBlocks) xhrGetBlocks.abort();
},
init: function() {
    $.when(
        renderInitialBlocks()
    ).then(function() {
        setTimeout(function() {
            displayDiffChart();
            refreshChart();
        }, 500)
    });
},
update: function() {
    renderLastBlock();
    updateText('networkHeight', localizeNumber(lastStats.height.toString()));
    updateText('networkTransactions', localizeNumber(lastStats.tx_count.toString()));
    updateText('networkHashrate', getReadableHashRateString(lastStats.difficulty / blockTargetInterval));
    updateText('networkDifficulty', getReadableDifficultyString(lastStats.difficulty, 0).toString());
    $("time.timeago").timeago();
    getPoolTransactions();
    var currHeight = $('#blocks_rows').children().first().data('height');
    if((currHeight + 31) > lastStats.last_known_block_index) {
        $.when(
            renderInitialBlocks()
        ).then(function() {
            setTimeout(function() {
                refreshChart();
            }, 100)
        });
    }
    if((currHeight + 31) < lastStats.last_known_block_index) {
        $('#next-page').removeClass('disabled');
    }
}
};

function renderLastBlock() {
$.ajax({
    url: api + '/json_rpc',
    method: "POST",
    data: JSON.stringify({
        jsonrpc:"2.0",
        id: "test",
        method:"getlastblockheader",
        params: {}
    }),
    dataType: 'json',
    cache: 'false',
    success: function(data) {
        last_block_hash = data.result.block_header.hash;
        $.ajax({
            url: api + '/json_rpc',
            method: "POST",
            data: JSON.stringify({
                jsonrpc:"2.0",
                id: "test",
                method:"f_block_json",
                params: {
                    hash: last_block_hash
                }
            }),
            dataType: 'json',
            cache: 'false',
            success: function(data) {
            block = data.result.block;
             //   updateText('totalCoins', getReadableCoins(block.alreadyGeneratedCoins,2));
              //  updateText('emissionPercent', (block.alreadyGeneratedCoins / 100000000000000 * 100).toFixed(4));
                updateText('currentReward', getReadableCoins(block.baseReward,4));
            }
        });
    }
});
}

var xhrGetBlocks;
$('#loadMoreBlocks').click(function() {
if (xhrGetBlocks) xhrGetBlocks.abort();
xhrGetBlocks = $.ajax({
    url: api + '/json_rpc',
    method: "POST",
    data: JSON.stringify({
        jsonrpc:"2.0",
        id: "test",
        method:"f_blocks_list_json",
        params: {
            height: $('#blocks_rows').children().last().data('height')
        }
    }),
    dataType: 'json',
    cache: 'false',
    success: function(data) {
        $.when(
             renderBlocks(data.result.blocks)
        ).then(function() {
            setTimeout(function() {
                loadMoreChart();
            }, 100)
        });
    }
});
});

$('#prev-page').click(function(e) {
if (xhrGetBlocks) xhrGetBlocks.abort();
var currHeight = $('#blocks_rows').children().first().data('height');
var openHeight = (currHeight - 31 < 0) ? 0 : currHeight - 31;

xhrGetBlocks = $.ajax({
    url: api + '/json_rpc',
    method: "POST",
    data: JSON.stringify({
        jsonrpc:"2.0",
        id: "test",
        method:"f_blocks_list_json",
        params: {
            height: openHeight
        }
    }),
    dataType: 'json',
    cache: 'false',
    success: function(data) {
        $('#blocks_rows').children().remove();
        $.when(
            renderBlocks(data.result.blocks)
        ).then(function() {
            setTimeout(function() {
                refreshChart();
            }, 100)
        });
    }
});
e.preventDefault();

if((currHeight + 31) > lastStats.last_known_block_index) {
    $('#next-page').removeClass('disabled');
}
if((currHeight - 61) < 0) {
    $('#prev-page').addClass('disabled');
}
});

$('#next-page').click(function(e) {
if (xhrGetBlocks) xhrGetBlocks.abort();
var currHeight = $('#blocks_rows').children().first().data('height');
var openHeight = (currHeight + 31 > lastStats.last_known_block_index) ? (lastStats.last_known_block_index) : currHeight + 31;

xhrGetBlocks = $.ajax({
    url: api + '/json_rpc',
    method: "POST",
    data: JSON.stringify({
        jsonrpc:"2.0",
        id: "test",
        method:"f_blocks_list_json",
        params: {
            height: openHeight
        }
    }),
    dataType: 'json',
    cache: 'false',
    success: function(data) {
        $('#blocks_rows').children().remove();
        $.when(
            renderBlocks(data.result.blocks)
        ).then(function() {
            setTimeout(function() {
                refreshChart();
            }, 100)
        });
    }
});
e.preventDefault();

if((currHeight + 61) > lastStats.last_known_block_index) {
    $('#next-page').addClass('disabled');
}

$('#prev-page').removeClass('disabled');
});

$('#goto-height-go').click(function() {
var height = document.getElementById('goto-height').value;
var newUrl = "/?height="+height;
window.location = newUrl;
});

$('#goto-height').keyup(function(e) {
if(e.keyCode === 13) {
    $('#goto-height-go').click();
}
});

function renderInitialBlocks() {
if (xhrGetBlocks) xhrGetBlocks.abort();
var loadHeight;

if (urlParam('height')) {
    loadHeight = parseInt(urlParam('height'));
} else {
    loadHeight = lastStats.last_known_block_index;
}

if((loadHeight - 31) < 0) {
    $('#prev-page').addClass('disabled');
    $('#next-page').removeClass('disabled');
}

xhrGetBlocks = $.ajax({
    url: api + '/json_rpc',
    method: "POST",
    data: JSON.stringify({
        jsonrpc:"2.0",
        id: "test",
        method:"f_blocks_list_json",
        params: {
            height: loadHeight
        }
    }),
    dataType: 'json',
    cache: 'false',
    success: function(data) {
        renderBlocks(data.result.blocks);
    }
});
};

function getBlockRowElement(block, jsonString) {
var row = document.createElement('tr');
row.setAttribute('data-json', jsonString);
row.setAttribute('data-height', block.height);
row.setAttribute('id', 'blockRow' + block.height);
row.setAttribute('title', block.hash);
var dateTime = new Date(block.timestamp * 1000).toISOString();
row.setAttribute('data-dt', dateTime);
var columns =
    '<td class="blk-height">' + localizeNumber(block.height) + '</td>' +
    '<td class="blk-size">' + localizeNumber(block.cumul_size) + '</td>' +
    '<td class="blk-hash">' + formatBlockLink(block.hash) + '</td>' +
    '<td class="blk-diff">' + localizeNumber(block.difficulty) + '</td>' +
    '<td class="blk-tx">' + localizeNumber(block.tx_count) + '</td>' +
    '<td class="date-time">' + formatDate(block.timestamp) + ' (<time class="timeago" datetime="'+dateTime+'"></time>)</td>';

Difficulties.push(parseInt(block.difficulty));
Blocks.push(parseInt(block.height));
Txses.push(parseInt(block.tx_count));
Sizes.push(parseInt(block.cumul_size));
Timestamps.push(dateTime);

row.innerHTML = columns;

return row;
}

function renderBlocks(blocksResults) {
var $blocksRows = $('#blocks_rows');

for (var i = 0; i < blocksResults.length; i ++) {
    var block = blocksResults[i];
    var blockJson = JSON.stringify(block);
    var existingRow = document.getElementById('blockRow' + block.height);

    if (existingRow && existingRow.getAttribute('data-json') !== blockJson) {
        $(existingRow).replaceWith(getBlockRowElement(block, blockJson));
    } else if (!existingRow) {
        var blockElement = getBlockRowElement(block, blockJson);
        var inserted = false;
        var rows = $blocksRows.children().get();
        for (var f = 0; f < rows.length; f++) {
            var bHeight = parseInt(rows[f].getAttribute('data-height'));
            if (bHeight < block.height) {
                inserted = true;
                $(rows[f]).before(blockElement);
                break;
            }
        }
        if (!inserted) {
            $blocksRows.append(blockElement);
        }
    }
}

$("time.timeago").timeago();
renderBlocksPageRange(blocksResults);
calcAvgHashRate();
}

function renderBlocksPageRange(blocks) {
var rendered = [
    localizeNumber(blocks[0].height),
    localizeNumber(blocks[blocks.length - 1].height)].join(' - ')
updateText('block-range', rendered);
}

function calcAvgHashRate() {
var sum = Difficulties.reduce(add, 0);
function add(a, b) {
    return a + b;
}
var avgDiff = Math.round(sum / Difficulties.length);
var avgHashRate = avgDiff / blockTargetInterval;

updateText('avgDifficulty', getReadableDifficultyString(avgDiff, 0).toString());
// updateText('avgHashrate', getReadableHashRateString(avgDiff / blockTargetInterval));
// updateText('blockSolveTime', getReadableTime(lastStats.difficulty / avgHashRate)); Add back after timestamp is added to mempool
}

//  Turtle MemPool Transactions
function getPoolTransactions() {
var xhrGetPool = $.ajax({
    url: api + '/json_rpc',
    method: "POST",
    data: JSON.stringify({
        jsonrpc:"2.0",
        id: "test",
        method:"f_on_transactions_pool_json",
        params: {}
    }),
    dataType: 'text',
    cache: 'false',
    success: function(data) {
        var txsRows = document.getElementById('mem_pool_rows');
        while (txsRows.firstChild) {
            txsRows.removeChild(txsRows.firstChild);
        }

        var rawTxs = data.split('"transactions":').pop();
        rawTxs = rawTxs.split('}}')[0];
        var transactions = JSON.parse(rawTxs);
        var txsArray = [];
        txsArray = rawTxs.split('\n\n');
        for(var tx in transactions) {
            var hash = transactions[tx].hash;
            if(hash != "") {
                var amount = transactions[tx].amount_out;
                var fee = transactions[tx].fee;
                var size = transactions[tx].size;
                var row = document.createElement('tr');
                var timestamp = Date().now; // this is not yet part of the json that gets returned in f_transactions_pool_json, leave for now
                var columns =
                    /*'<td>' + formatDate(timestamp) + ' (<span class="mtx-ago"></span>)' + '</td>' +*/
                    '<td>' + getReadableCoins(amount, 4, true) + '</td>' +
                    '<td>' + getReadableCoins(fee, 4, true) + '</td>' +
                    '<td>' + localizeNumber(size) + '</td>' +
                    '<td>' + formatPaymentLink(hash) + '</td>';
                row.innerHTML = columns;
                $(txsRows).append(row);
                //$(row).find('.mtx-ago').timeago('update', new Date(timestamp * 1000).toISOString()); We can re-enable this after a timestamp is added to the mem_pool json
            }
        }
        updateText('mempool_count', document.querySelectorAll('#mem_pool_rows tr').length);
    },
    error: function(data) {console.log(data);}
});
};

// Difficulty chart
function displayDiffChart() {
var ctx = document.getElementById("difficultyChart");
var chartData = {
    //labels: [].concat(Blocks).reverse(),
    labels: [].concat(formatDate(Timestamps)).reverse(),
    datasets: [{
        data: [].concat(Blocks).reverse(),
        yAxisID: "Height",
        label: "Height",
        backgroundColor: "rgba(0,0,0,0)",
        borderColor: 'rgba(0,0,0,0)',
        borderWidth: 0,
        pointBorderWidth: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 0,
        display: false
    }, {
        data: [].concat(Difficulties).reverse(),
        yAxisID: "Difficulty",
        label: "Diff",
        backgroundColor: "rgba(46,204,113,0)",
        borderColor: '#2ecc71',
        borderWidth: 2,
        pointColor: "#2ecc71",
        pointBorderColor: "#ffffff",
        pointHighlightFill: "#ffffff",
        pointBackgroundColor: "#2ecc71",
        pointBorderWidth: 1,
        pointRadius: 2,
        pointHoverRadius: 1,
        pointHitRadius: 20
    }, {
        data: [].concat(Txses).reverse(),
        yAxisID: "Transactions",
        label: "Txs",
        backgroundColor: "rgba(0,0,0,0)",
        borderColor: 'rgba(0,0,0,0)',
        borderWidth: 0,
        pointBorderWidth: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 0,
    }, {
        data: [].concat(Sizes).reverse(),
        yAxisID: "Sizes",
        label: "Size",
        backgroundColor: "rgba(0,0,0,0)",
        borderColor: 'rgba(0,0,0,0)',
        borderWidth: 0,
        pointBorderWidth: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 0,
    }]
};

var options = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
        line: {
            tension: 0
        }
    },
    title: {
        display: false
    },
    legend: {
        display: false
    },
    scales: {
        yAxes: [{
            id: 'Height',
            type: 'linear',
            position: 'left',
            scaleLabel: {
                display: false,
                labelString: 'Height'
            },
            gridLines: {
                display: false
            },
            ticks: {
                fontSize: 9,
                display: false
            },
            display: false
        }, {
            id: 'Difficulty',
            type: 'linear',
            position: 'left',
            scaleLabel: {
                display: false,
                labelString: 'Difficulty'
            },
            gridLines: {
                display: false
            },
            ticks: {
                fontSize: 9,
                display: false
            },
            display: false
        }, {
            id: 'Transactions',
            type: 'linear',
            position: 'right',
            scaleLabel: {
                display: false,
                labelString: 'Transactions'
            },
            gridLines: {
                display: false
            },
            ticks: {
                fontSize: 9,
                display: false
            },
            display: false
        }, {
            id: 'Sizes',
            type: 'linear',
            position: 'right',
            scaleLabel: {
                display: false,
                labelString: 'Size'
            },
            gridLines: {
                display: false
            },
            ticks: {
                fontSize: 9,
                display: false
            },
            display: false
        }],
        xAxes: [{
            type: "time",
            time: {
                parser: false,
                unit: 'minute',
                unitStepSize: 60,
                round: 'second',
                displayFormats: {
                    'millisecond': 'SSS [ms]',
                    'second': 'HH:mm:ss', // 11:20:01 AM
                    'minute': 'HH:mm', // 11:20:01 AM
                    'hour': 'HH:mm', // Sept 4, 5PM
                    'day': 'MMM Do', // Sep 4 2015
                    'week': 'll', // Week 46, or maybe "[W]WW - YYYY" ?
                    'month': 'MMM YYYY', // Sept 2015
                    'quarter': '[Q]Q - YYYY', // Q3
                    'year': 'YYYY', // 2017
                },
            },
            gridLines: {
                display: false
            },
            ticks: {
                fontSize: 9,
                fontColor: "#CCC",
                autoSkip: true,
                //maxRotation: 90,
                //minRotation: 90
                //display:false
            }
            //display: false
        }]
    },
    tooltips: {
        mode: 'index',
        //displayColors: false,
        callbacks: {
            title: function(tooltipItem, data) {
                var height = data.datasets[3].data[tooltipItem[0].index];
                var time = new Date(data.labels[tooltipItem[0].index]).toLocaleString();
                //return 'Блок №: ' + height + ' - ' + time + '';
                return time + '';
            },
            /*
            label: function(tooltipItem, data) {
                var diff        = data.datasets[0].data[tooltipItem.index];
                var txcount = data.datasets[1].data[tooltipItem.index];
                var size        = data.datasets[2].data[tooltipItem.index];

                var diff_swatch_color = data.datasets[0].borderColor;

                console.log(diff_swatch_color);

                var diff_swatch = '<span style="color="'+ diff_swatch_color +'">&bullet;</span>';

                var multistringText = [];

                var str1 = diff_swatch + 'Складність: ' + diff + '';
                var str2 = 'Розмір: ' + size + '';
                var str3 = 'Транзакції: ' + txcount + '';

                multistringText.push(str1);
                multistringText.push(str2);
                multistringText.push(str3);

                return multistringText;
            }*/
        }
    }
};
diffChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: options
});
}

function refreshChart() {
var brows = $('#blocks_rows').children(),
    labels = [],
    diffs = [],
    sizes = [],
    times = [],
    heights = [],
    txsnr = [];
for (var i = 0; i < brows.length; i++) {
    var row = $(brows[i]);
    var label = parseInt(row.find('td:first').text().replace(/,/g,""));
    var diff = parseInt(row.find('td.blk-diff').text().replace(/,/g,""));
    var txses = parseInt(row.find('td:nth-child(5)').text().replace(/,/g,""));
    var size = parseInt(row.find('td:nth-child(2)').text().replace(/,/g,""));
    var time = row.attr('data-dt');

    labels.push(label);
    diffs.push(diff);
    txsnr.push(txses);
    sizes.push(size);
    times.push(time);
}
//diffChart.data.labels = labels.reverse();
if (diffChart) {
    diffChart.data.labels = times.reverse();
    diffChart.data.datasets[0].data = labels.reverse();
    diffChart.data.datasets[1].data = diffs.reverse();
    diffChart.data.datasets[2].data = txsnr.reverse();
    diffChart.data.datasets[3].data = sizes.reverse();
    diffChart.update();
}
}

function loadMoreChart() {
//diffChart.data.labels = [].concat(Blocks).reverse();
diffChart.data.labels = [].concat(Timestamps).reverse();
diffChart.data.datasets[0].data = [].concat(Blocks).reverse();
diffChart.data.datasets[1].data = [].concat(Difficulties).reverse();
diffChart.data.datasets[2].data = [].concat(Txses).reverse();
diffChart.data.datasets[3].data = [].concat(Sizes).reverse();
diffChart.update();
}

/*     $(function() {
$('[data-toggle="tooltip"]').tooltip();
}); */

function getReadableTime(seconds) {

var units = [
    [60, 's.'],
    [60, 'min.'],
    [24, 'h.'],
    [7, 'd.'],
    [4, 'w.'],
    [12, 'м.'],
    [1, 'y.']
];

function formatAmounts(amount, unit) {
    var rounded = Math.round(amount);
    return '' + rounded + ' ' + unit + (rounded > 1 ? '' : '');
}

var amount = seconds;
for (var i = 0; i < units.length; i++) {
    if (amount < units[i][0])
        return formatAmounts(amount, units[i][1]);
    amount = amount / units[i][0];
}
return formatAmounts(amount, units[units.length - 1][1]);
}