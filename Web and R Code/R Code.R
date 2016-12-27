library(lubridate)
library(plyr)
library(tidyr)
library(dplyr)
library(pracma)
library(data.table)
#Read Data
data<-read.csv("https://sushantparkhi.com/uber.csv",header=TRUE)
latlong<-read.csv("https://sushantparkhi.com/Areas.csv",header=TRUE)
userLat<-42.35018669999999
userLng<--71.12772310000003
userWeek<-3
userHours<-15
dist<-1.8420681484560633
#Processing Data
#LatLong
latlong<-separate(data = latlong, col = latlong, into = c("latitude", "longitude"), sep = "\\,")
latlong$latitude<-as.numeric(latlong$latitude)
latlong$longitude<-as.numeric(latlong$longitude)
#UberData
data<-separate(data = data, col = start_coordinates, into = c("latitude", "longitude"), sep = "\\,")
data$latitude<-as.numeric(data$latitude)
data$longitude<-as.numeric(data$longitude)
data$Date_Time_Converted<- as.POSIXct(strptime(paste(data$date,data$time),format="%A, %B %d, %Y %r"))
data$hours<-as.double(strftime(data$Date_Time_Converted,format="%k"))
data$minutes<-as.double(strftime(data$Date_Time_Converted,format="%M"))
data$week<-as.double(strftime(data$Date_Time_Converted,format="%w"))

#Getting Neighbour
#Calculating Distance Between Lat Long
#Haversine Formula
distanceLatLong<-function(x){
r<-3958.756
dLat<-deg2rad(as.numeric(x[2])-userLat)
dLong<-deg2rad(as.numeric(x[3])-userLng)
a<-sin(dLat/2)*sin(dLat/2)+cos(deg2rad(userLat))*cos(deg2rad(as.numeric(x[2])))*sin(dLong/2)*sin(dLong/2)
c<-2*atan2(sqrt(a),sqrt(1-a))
d<-r*c
return(d)
}
latlong$Distance<-apply(latlong,1,distanceLatLong)
area<-latlong[which(latlong$Distance == min(latlong$Distance)), ]

#Filtering Data
filtered_data<-filter(data,latitude==area$latitude)
filtered_data<-filter(filtered_data,longitude==area$longitude)
filtered_data<-filter(filtered_data,week==userWeek)
filtered_data<-filter(filtered_data,hours==userHours)

#For Plotting on that Hour Distance Average
breaks <- c(0,2,4,6,8,10,12,14)
new_d<-data.table(filtered_data)
new_frame_dist_mean<-new_d[,list(mean=mean(average)),by=list(distance=cut(distance,breaks=breaks))][order(distance)]

filtered_data<-filter(data,latitude==area$latitude)
filtered_data<-filter(filtered_data,longitude==area$longitude)
filtered_data<-filter(filtered_data,week==userWeek)
new_d<-data.table(filtered_data)
new_frame_time_average <- new_d[, mean(average, na.rm = TRUE),by = hours]

filtered_data<-filter(data,latitude==area$latitude)
filtered_data<-filter(filtered_data,longitude==area$longitude)
filtered_data<-filter(filtered_data,hours==userHours)
new_d<-data.table(filtered_data)
new_frame_week_average<-new_d[, mean(average, na.rm = TRUE),by = week]

#Regression
filtered_data<-filter(data,latitude==area$latitude)
filtered_data<-filter(filtered_data,longitude==area$longitude)
filtered_data<-filter(filtered_data,week==userWeek)
filtered_data<-filter(filtered_data,hours==userHours)

attach(filtered_data)
reg<-lm(average~distance)

#Predicting Price by Distance
predict_frame <- data.frame(distance=dist)
predict_price<-predict(reg,newdata=predict_frame)

output_list<-list()
output_list[[1]]<-predict_price
output_list[[2]]<-area
output_list[[3]]<-new_frame_dist_mean
output_list[[4]]<-new_frame_time_average
output_list[[5]]<-new_frame_week_average
output_list
