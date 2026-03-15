import pandas as pd
import re

def analyze_chat(chat_text):

    pattern = r"\[(\d{1,2}/\d{1,2}/\d{4}), (\d{1,2}:\d{2}:\d{2} [APM]{2})\] (.*?): (.*)"

    messages = re.findall(pattern, chat_text)

    df = pd.DataFrame(messages, columns=["date","time","user","message"])

    total_messages = len(df)

    users = df["user"].value_counts().to_dict()
    df["datetime"] = pd.to_datetime(df["date"] + " " + df["time"])

    df["year"] = df["datetime"].dt.year
    df["month"] = df["datetime"].dt.month
    df["day"] = df["datetime"].dt.day
    df["hour"] = df["datetime"].dt.hour
    time = df['datetime']
    year = df['year']
    month = df['month']
    day = df['day']
    hour = df['hour']
    print(time)
    print(year)
    print(month)
    print(day)
    print(hour)
    
    return {
        "total_messages": total_messages,
        "users": users,
        "time" : time,
        'year' : year,
        'month' : month,
        'day' : day,
        'hour': hour
    }