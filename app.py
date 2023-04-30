from flask import Flask, jsonify, render_template
from oauth2client.service_account import ServiceAccountCredentials
from pmdarima.arima import auto_arima
import gspread
import pandas as pd



app = Flask(__name__)

def getdata():
    credentials_key = {
      "type": "service_account",
      "project_id": "inbound-column-384915",
      "private_key_id": "ed247b4729154dbde83f99eb769b1538593e6826",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC2bRLhCOXopHZX\nGH7zZcPNiMn7s+NGAaxZ8vut0rbp5gJ/IDunkaYAQFxcJLe+H3aJgB78aIblij8n\n6TCA8BcyqQDPWglToVKepjJsQVVix6vEFvU7bhJPQFLShKeJiqsJnUmuI68HOw/6\nu+Yir+yTRhajSE0FNUAKdB+K6MtLRNfNyK17AXN9ybwLXSMdnH6vYlPGP84N7hLa\nOzm9n0YEV/B+3aDf+VKR0BvHZXf5/sc79S10IYU/rWtR88n0NvvA4AxQoZFWjJQf\noIacoud969LwPH0mI3Pe9QFwisNq7aDIofgXZZv9iKf729lUEo2AdddbS4kLkurF\ns5xQXkjhAgMBAAECggEAVi6HWbqratGveov/BZvQ+duimH+uYhdORhxNnBvNAAkC\nqu4eYJalVr8RIxLRn0cb5++YM+Rpvi0mkwNOP8utGejPkiXV/CVdc8fOUGg5H3Z3\nBidWaWIh0kDwH7Y9s/PHw74D3fnLqV3Uub5lBYQY/qaA8Vip0kkK3SVo9WXvDLpI\nA9KUMgj9+/JXHpDiKKFJ6rXFI1gwNJVgQobXJ/ihIX+zsXgG+ByIznbS8/UpzRzV\nz3hMzMi6A/JyRApuGXOzMboXjMpU90ry9Avy5W6pN/3c43+CCsHca22SHmJ3bBVN\n+moKLpZqMwf1dD6NARe6xjQ3tIWQOdaOph6l+PlCxQKBgQDcSQ4JT2PHzcgA/vPA\nypkx0oWwMwJkgKnw6XCaDMZUh3DdKqMatvOC5UGY/AEnpJ87StJYlS7ZUyPbHHMS\nPW8MC54sFTXEzyIKroijlNT0TShFmQEfMHwDCH9q0r5+v3GUiUe1ykFXvnyVcfcL\nT7z1KAzcL4GygNTKGHXk/sRNRwKBgQDUAKshJsTfDT9hOplq+iPEGBMv8q4bYjUa\nD8GOT+KIrP5RCx8C4XJaISliVZTvM5deIdHjp3qMiAOHmxM98fwhPasKTZRh8Xn6\n98VZ+j1WXYdXlZ9aZuZYhqswNBsEypnfJ1Dk52BwH5N5CojXP1tb/HCjc/pq2aJI\nn9XfJI+slwKBgQDaqypj04sZLAz98BfHqVWpP3G2FuypF4+atiAwy72U613+LfT6\n7+GKbklPs9jxoVjvYrareGupD/7n4rXXxWQWcPHykJtvYq5ILDk3KOa8HFt9uwSC\nEX8JA8Z4I/s1lpUI/b1RmBSFJXJGZ3r0n5LTSY56hC4bJAgXFXDygHQcwQKBgGwx\nYyRqCrLiqePO6hjkS3h56ODhcuVau0rvm5IrRqsFzkxB5rOrppZEskAS+Q0SQT+y\n9tC92hb6GwMLq0hDxK6aMD3z1bQebmgcJsWCpeb7mGSkYUzbkta+84KINPm/A8QU\n5n3LbzYJh1OQgsGG/fL14+4m9DevldiGabmViRVFAoGARo47ecXX72MJiA4wpYjo\nhob1gTODkReIEr535uvDjYS2ri5GFKmureBjuUW46Z9DiYNVOvQH5l3coGGXv/6Z\nCzdLZkjSzCHA7JN9BjXNBNolAdmqkEzr+30I06gu3IGIbHxK+l+zQYHYkTcD9qPY\nHfsM7Xk7fpoV6OHtuOeMWJ8=\n-----END PRIVATE KEY-----\n",
      "client_email": "alda-820@inbound-column-384915.iam.gserviceaccount.com",
      "client_id": "117268117014751553575",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/alda-820%40inbound-column-384915.iam.gserviceaccount.com"
    }

    file_name = "App v2"
    sheet_name = "PriceChart"
    credentials = ServiceAccountCredentials.from_json_keyfile_dict(credentials_key)
    client = gspread.authorize(credentials)
    sheet = client.open(file_name).worksheet(sheet_name)
    data = sheet.get_all_values()
    return data


@app.get("/")
def main():
    return render_template("index.html")


@app.route('/predict', methods=['POST'])
def predict():
    data = getdata()
    df = pd.DataFrame.from_records(data[25:],columns = data[0])
    df.iloc[0:,7] = df.iloc[0:,7].apply(lambda x: float(x.replace(',', '.')))
    data = df.sort_index(ascending=True, axis=0)
    data = data.iloc[::-1]
    train = data[:987]
    training = train.iloc[0:,7]
    training.index = training.index-1

    model = auto_arima(training, start_p=1, start_q=1,max_p=3, max_q=3, m=10,start_P=0,
                       seasonal=True,d=1, D=1, trace=True,error_action='ignore',suppress_warnings=True)
    model.fit(training)

    endClose = train.iat[training.index.stop,7]
    forecast = model.predict(n_periods=int(30))
    forecast = pd.DataFrame(forecast,columns=['Prediction'])
    forecast.loc[training.index.stop-1] = [endClose] 
    forecast = forecast.sort_index()
    return jsonify(forecast.to_dict())

if __name__ == '__main__':
    app.run()