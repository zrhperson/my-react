/**
* @author zhourh
* @date 2021/10/18
* @description 翻译模块
*/
import React from "react";
import { useSelector } from 'react-redux'
import {useImmer} from 'use-immer'
import { RootState } from "@store";
import { debounce } from './index'
import { translateService } from "../services/commonService";

interface IData {
    [propName: string]: any
}
/* 每个字段注册防抖函数 */
const transFunc:IData = {}
/**
* @param dataSet 初始化数据集合 没有数据就传null {[name]: null},有数据就传{[name]: {[lang]: value}}
* @return {translate, data} data: {[name]: {[lang]: value}}
*/
function useTranslate(dataSet: IData) {
    const {langList = [], currentLang}: {langList: string[], currentLang: string}= useSelector((state: RootState) => state.lang);

    /**
    * @desc 初始化数据
    * @param data 传入的数据集合
    * @return data 
    */
    const init = (data: IData) => {
        const temp: IData = {}
        for (const nameItem in data) {
            if(data[nameItem]){
                temp[nameItem] = {};
                langList.forEach(l => {
                    temp[nameItem][l] = data[nameItem][l] || '';
                });
            }else{
                temp[nameItem] = {};
                langList.forEach(l => {
                    temp[nameItem][l] = ''
                });
            }
        }
        return temp
    }
    const [data, setData] = useImmer(init(dataSet))

    /**
    * @desc 返回翻译的值，防抖
    */
    const getResult = debounce(async (name:string, value:string, callback?: (nameItem: IData) => void) => {
        const nameObj:IData = {}
        if(!value){
            langList.forEach(l => {
                nameObj[l] = '';
            });
            setData(draft => {
                draft[name] = nameObj
            })
            return
        }
        const result = await translateService({data: value, lanId: 'en'})
        langList.forEach(l => {
            if(l === 'en_US') {
                nameObj[l] = `${result}`
            }else{
                nameObj[l] = l === currentLang ? value : `${value}-${l}`;
            }
        });
        setData(draft => {
            draft[name] = nameObj
        })
        callback && callback(nameObj)
    },1000)

    /**
     * @param name 需要翻译的字段名
     * @param value 字段名对应的值
    * @desc 实时翻译
    */
    const translate = (name: string, value: string, callback?: (nameItem: IData) => void) => {
        if(!data[name]){
            addName(name)
        }
        if(!transFunc[name]){
            transFunc[name] = getResult
        }
        transFunc[name](name, value, callback)
    }

    /**
     * @param value 修改后的值
     * @param name 修改哪一个字段
     * @param language 修改字段某一个语言的值
    * @desc 支持修改某一项数据
    * @desc 场景：修改翻译后的数据
    */
    const updateData = (value: string | IData, name: string, language?: string) => {
        if(language){
            setData(draft => {
                draft[name][language] = value
            })
        }else{
            setData(draft => {
                draft[name] = value
            })
        }
    }

    /** 
    * @param name 字段名
    * @desc 动态添加需要翻译的字段名 
    */
    const addName = (name: string) => {
        transFunc[name] = getResult
        const nameObj:IData = {}
        langList.forEach(l => {
            nameObj[l] = '';
        });
        setData(draft => {
            draft[name] = nameObj
        })
    }

    /**
    * @desc 设置数据,传全字段数据。
    * @param data 传入的数据集合
    * @return data 
    */
    const initData = (data: IData) => {
        const dataset = init(data);
        setData(dataset)
    }


    return { translate, data, updateData, addName, initData }
}
export default useTranslate;