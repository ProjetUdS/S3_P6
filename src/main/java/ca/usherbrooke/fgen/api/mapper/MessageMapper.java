package ca.usherbrooke.fgen.api.mapper;


import ca.usherbrooke.fgen.api.business.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MessageMapper {

    List<Message> select(@Param("trimesterId") String trimesterId,
                         @Param("profileId") String profileId,
                         @Param("unit")String unit,
                         @Param("id") Integer id);
    Message selectOne(@Param("id") Integer id);
    void deleteOne(@Param("id") Integer id);
    List<Message> allMessages();
    void insertMessage(@Param("message") Message message);
    Integer getNewId();
}
