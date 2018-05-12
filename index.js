console.log('开始时间(ms): ' + Date.now());
const request = require('request');
const settings = require('./config.json');

const qb = require('node-querybuilder').QueryBuilder(settings.mysql, 'mysql');
const table = 'qq_districts';

// 行政区划json地址
const directUrl = 'http://apis.map.qq.com/ws/district/v1/list?key=' + settings.qq_key;
var version='';
request.get(directUrl, function(error, response, body) {
    if (response && response.statusCode == 200) {
        var json = JSON.parse(body);
        version = json.data_version;
        if (json.status == 0) { // 代表获取成功
            for (var layer1=0; layer1<json.result[0].length; layer1++) { //一级区域
                var level = 0;
                var region1 = json.result[0][layer1];
                updateOrCreate(region1, level, 0);
                if(region1.cidx) { // 包含2级区域
                    for(var layer2=region1.cidx[0]; layer2<region1.cidx[1]; layer2++ ) {
                        level=1;
                        var region2 = json.result[level][layer2];
                        updateOrCreate(region2, level, region1.id);
                        if(region2.cidx) { //包含3级区域
                            for(var layer3=region2.cidx[0]; layer3<region2.cidx[1]; layer3++ ) {
                                level=2;
                                var region3 = json.result[level][layer3];
                                updateOrCreate(region3, level, region2.id);
                            }
                        }
                    }
                }
            }
        }
    } else {
        console.log('行政区划数据获取失败:', error);
    }
});

// 插入地区
function updateOrCreate(row, layer, parent_id=0) {
    // 省市级才具有name\pinyin
    var data = {
        id: row.id,
        fullname: row.fullname,
        lat: row.location.lat,
        lng: row.location.lng,
        parent_id: parent_id,
        layer: layer,
        version: version,
    };
    if (layer < 2) {
        data.name = row.name;
        data.pinyin = row.pinyin.join('');
        data.letter = row.pinyin[0].charAt(0).toUpperCase();
    } else {
        data.name = row.fullname; //全名取作名字
    }

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