import React from 'react'
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native'
import pro from '../assets/images/pro3.jpg'
import PrimaText from './PrimaText'
const PrimaButton = ({
    content = "Our Text",
    top = 0,
    left = 0,
    right = 0,
    bottom = 0,
    size = 12,
    weight = "normal",
    decoration = "none",
    color = "#000",
    align = 'center',
    bgColor = "#0A5CC1",
    width = "auto",
    height = 56,
    opacity = 1,
    iWidth = 24,
    iHeight = 24,
    bColor = "#ddd",
    bWidth = 0,
    radius = 0,
    distance = 5,
    isLeftIcon = false,
    isContent = true,
    isRightIcon = false,
    leftIcon = null,
    rightIcon = null,
    ph = 0, //padding horizontal
    onPress,
    isLoading = false
}) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <View
                style={{
                    opacity,
                    width,
                    height,
                    backgroundColor: bgColor,
                    marginTop: top,
                    marginRight: right,
                    marginBottom: bottom,
                    marginLeft: left,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: align,
                    alignItems: 'center',
                    borderWidth: bWidth,
                    borderColor: bColor,
                    borderStyle: 'solid',
                    borderRadius: radius,
                    paddingHorizontal: ph
                }}
            >
                {isLeftIcon &&
                    <Image
                        source={leftIcon == null ? pro : leftIcon}
                        style={{
                            width: iWidth,
                            height: iHeight,
                            marginRight: distance
                        }}
                    />
                }
                {isLoading && <ActivityIndicator size="small" color="#00ff00" style={{ marginRight: 10 }} />}
                {isContent &&
                    <PrimaText
                        content={content}
                        size={size}
                        weight={weight}
                        decoration={decoration}
                        color={color}

                    />
                }

                {isRightIcon &&
                    <Image
                        source={rightIcon == null ? pro : rightIcon}
                        style={{
                            width: iWidth,
                            height: iHeight,
                            marginLeft: distance
                        }}
                    />
                }
            </View>
        </TouchableOpacity>
    )
}

export default PrimaButton