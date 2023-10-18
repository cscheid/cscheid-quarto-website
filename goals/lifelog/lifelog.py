#!/usr/bin/env python3

import polars as pl
from datetime import datetime, timedelta
import pandas as pd
import altair as alt
import os
import json
import yaml
import numpy as np
import glob
import datetime

def get_lifelog(path):
    what = []
    amount = []
    when = []
    for file in glob.glob(path):
        for row in yaml.safe_load(open(file)):
            print(row)
            what.append(row["what"])
            amount.append(row["amount"])
            when.append(datetime.datetime.fromisoformat(row["when"]))
    return pl.DataFrame({ 
        "what": what,
        "amount": amount,
        "when": when
    })

def get_activity(ll, what):
    return (ll.sort(pl.col("when")).
        filter(pl.col("what") == what).
        with_columns(pl.col("amount").
            cumsum().
            alias("total")))

def daily_data(ll, goal):
    ll = ll.sort(pl.col("when"))
    ll = (ll.with_columns(pl.
            col("when").
            cast(pl.Date).
            alias("date")).
        groupby("date").
        last().
        drop("when"))
    ll = ll.with_columns(
        (((pl.col("date") - datetime.date(2023, 1, 1)).cast(int) / 86400000) * goal + goal).
        alias("goal"))
    ll = ll.with_columns(
        (pl.col("goal") - pl.col("total")).
        alias("deficit"))
    return ll
    # return (with_columns(pl.col("when").
    #         date().
    #         alias("date")).
    #     groupby("date").
    #     unique(subset='index', keep="last"))

def weekly_average(ll):
    # let's just do this the dumb way bc i'm not smart enough to get the 
    # window function to work or the join_asof to work either
    date = list(ll["date"])
    prev = []

    for i, v in enumerate(date):
        # this could even be a binary search
        closest_index = None
        for j, w in enumerate(date):
            if v <= w + datetime.timedelta(days=7):
                break
            if j == i:
                break
            closest_index = j
        if closest_index is None or (v - date[closest_index]) < datetime.timedelta(days=7):
            prev.append(None)
        else:
            prev.append(date[closest_index])
    
    ll = ll.with_columns(pl.Series(prev).alias("prev"))

    return (ll.
        with_columns(pl.col("date").alias("date_copy")).
        join(how="inner", left_on="date", right_on="prev", other=ll).
        with_columns(((pl.col("total_right") - pl.col("total")) / ((pl.col("date_right") - pl.col("date")).cast(int) / 86400000))
            .alias("daily_avg_prev_week")).
        drop([
            "what", "what_right", "prev", "amount", 
            "deficit", "total", "date", "goal", "date_copy"]).
        rename({ 
            "date_right": "date", 
            "deficit_right": "deficit", 
            "goal_right": "goal", 
            "total_right": "total", 
            "amount_right": "amount"}).
        with_columns((pl.col("total") / ((pl.col("date") - datetime.date(2023, 1, 1)).cast(int) / 86400000)).alias("daily_avg_total"))
        )


def get_data_on(key):
    ll = get_lifelog("/Users/cscheid/Dropbox/Documents/lifelog/*.yml")
    return weekly_average(
        daily_data(
            get_activity(
                ll, key), 24)).with_columns(
                    ((pl.col("date") - datetime.date(2023, 1, 1)).cast(int) // 86400000).alias("days")
                ).drop("date")
