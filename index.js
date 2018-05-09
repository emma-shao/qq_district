console.log('开始时间(ms): ' + Date.now());
const request = require('request');
const settings = require('./config.json');

const qb = require('node-querybuilder').QueryBuilder(settings.mysql, 'mysql');
const table = 'qq_district';

// 行政区划json地址
const directUrl = 'http://apis.map.qq.com/ws/district/v1/list?key=' + settings.qq_key;
var version='';
request.get(directUrl, function(error, response, body) {
    if (response && response.statusCode == 200) {
        var json = JSON.parse(body);
        version = json.data_version;
        if (json.status == 0) { // 代表获取成功
            for (var i=0; i<json.result[0].length; i++) { //一级区域
                var region = json.result[0][i];
                console.log(region);
                updateOrCreate(region, i, 0);
                // throw 'assert';
            }
        }
    } else {
        console.log('行政区划数据获取失败:', error);
    }
});

// 插入地区
function updateOrCreate(row, layer, parent_id=0) {
    var data = {
        id: row.id,
        name: row.name,
        fullname: row.fullname,
        pinyin: row.pinyin.join(''),
        lat: row.location.lat,
        lng: row.location.lng,
        parent_id: parent_id,
        initial: row.pinyin[0].charAt(0),
        layer: layer,
        version: version,
    };
    console.log(data);
    qb.select('id').where({id: data.id}).get(table, (err,res)=>{
        if(err) {
            console.log(data);
            throw err;
        }
        if (res.length) { // 存在进行更新
            qb.update(table, data, {id: data.id}, (err, res)=>{
                if(err) {
                    console.log(data);
                    throw err;
                } else {
                    console.log(data.id + '更新 时间(ms):' + Date.now());
                }
            });
        } else { // 不存在进行新增
            console.log('新增');
            qb.insert(table, data, (err, res)=>{
                if(err) {
                    console.log(data);
                    throw err;
                } else {
                    console.log(data.id + '新增 时间(ms):' + Date.now());
                }
            });
        }
    });
}